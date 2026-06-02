import pool from '../../config/db';
import { generateStudyPlan } from '../ai/ai.service';
import { generateStudyPlanWithContext,generateTopicNotes } from '../ai/ai.service';

export const createStudyPlan = async (userId: number, studentName: string) => {
  // Get user courses
  const coursesResult = await pool.query(
    'SELECT * FROM courses WHERE user_id = $1 ORDER BY exam_date ASC',
    [userId]
  );

  const courses = coursesResult.rows;

  if (courses.length === 0) {
    throw new Error('No courses found. Please add courses first.');
  }

  // Generate plan with AI
  const aiTasks = await generateStudyPlan(
    courses.map(c => ({
      name: c.name,
      exam_date: c.exam_date.toISOString().split('T')[0],
      difficulty: c.difficulty
    })),
    studentName
  );

  // Save plan to database
  const planResult = await pool.query(
    'INSERT INTO study_plans (user_id, status) VALUES ($1, $2) RETURNING *',
    [userId, 'active']
  );

  const plan = planResult.rows[0];

  // Save tasks to database
  const savedTasks = [];
  for (const task of aiTasks) {
    // Find matching course
    const course = courses.find(c => c.name === task.course_name);

    const taskResult = await pool.query(
      `INSERT INTO study_tasks (plan_id, course_id, day_date, topic, duration_minutes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [plan.id, course?.id || null, task.day_date, task.topic, task.duration_minutes]
    );
    savedTasks.push(taskResult.rows[0]);
  }

  return { plan, tasks: savedTasks };
};

export const getStudyPlan = async (userId: number) => {
  // Get active plan
  const planResult = await pool.query(
    'SELECT * FROM study_plans WHERE user_id = $1 AND status = $2 ORDER BY generated_at DESC LIMIT 1',
    [userId, 'active']
  );

  if (planResult.rows.length === 0) {
    throw new Error('No active study plan found');
  }

  const plan = planResult.rows[0];

  // Get tasks with course names
  const tasksResult = await pool.query(
    `SELECT st.*, c.name as course_name 
     FROM study_tasks st
     LEFT JOIN courses c ON st.course_id = c.id
     WHERE st.plan_id = $1
     ORDER BY st.day_date ASC`,
    [plan.id]
  );

  return { plan, tasks: tasksResult.rows };
};

export const completeTask = async (taskId: number, userId: number) => {
  // Verify task belongs to user
  const verify = await pool.query(
    `SELECT st.id FROM study_tasks st
     JOIN study_plans sp ON st.plan_id = sp.id
     WHERE st.id = $1 AND sp.user_id = $2`,
    [taskId, userId]
  );

  if (verify.rows.length === 0) {
    throw new Error('Task not found');
  }

  const result = await pool.query(
    'UPDATE study_tasks SET is_completed = TRUE, completed_at = NOW() WHERE id = $1 RETURNING *',
    [taskId]
  );

  return result.rows[0];
};

export const checkPlanExists = async (userId: number) => {
  const result = await pool.query(
    'SELECT id FROM study_plans WHERE user_id = $1 AND status = $2 LIMIT 1',
    [userId, 'active']
  );
  return result.rows.length > 0;
};

export const regenerateStudyPlan = async (userId: number, studentName: string) => {
  // Get current active plan
  const currentPlan = await pool.query(
    'SELECT * FROM study_plans WHERE user_id = $1 AND status = $2 ORDER BY generated_at DESC LIMIT 1',
    [userId, 'active']
  );

  // Get completed tasks from current plan
  let completedTopics: string[] = [];
  if (currentPlan.rows.length > 0) {
    const completedTasks = await pool.query(
  `SELECT st.topic, c.name as course_name 
   FROM study_tasks st
   LEFT JOIN courses c ON st.course_id = c.id
   WHERE st.plan_id = $1 AND st.is_completed = true`,
  [currentPlan.rows[0].id]
);
console.log('✅ Completed tasks raw:', completedTasks.rows);
    completedTopics = completedTasks.rows.map(t => `${t.course_name}: ${t.topic}`);
    // Mark current plan as completed
    await pool.query(
      'UPDATE study_plans SET status = $1 WHERE id = $2',
      ['completed', currentPlan.rows[0].id]
    );
  }

  // Get user courses
  const coursesResult = await pool.query(
    'SELECT * FROM courses WHERE user_id = $1 ORDER BY exam_date ASC',
    [userId]
  );

  const courses = coursesResult.rows;

  if (courses.length === 0) {
    throw new Error('No courses found. Please add courses first.');
  }

  // Generate new plan with AI — passing completed topics
  const aiTasks = await generateStudyPlanWithContext(
    courses.map(c => ({
      name: c.name,
      exam_date: c.exam_date.toISOString().split('T')[0],
      difficulty: c.difficulty
    })),
    studentName,
    completedTopics
  );

  // Save new plan
  const planResult = await pool.query(
    'INSERT INTO study_plans (user_id, status) VALUES ($1, $2) RETURNING *',
    [userId, 'active']
  );

  const plan = planResult.rows[0];

  // Save new tasks
  const savedTasks = [];
  for (const task of aiTasks) {
    const course = courses.find(c => c.name === task.course_name);
    const taskResult = await pool.query(
      `INSERT INTO study_tasks (plan_id, course_id, day_date, topic, duration_minutes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [plan.id, course?.id || null, task.day_date, task.topic, task.duration_minutes]
    );
    savedTasks.push(taskResult.rows[0]);
  }

  return { plan, tasks: savedTasks };
};

export const getTaskNotes = async (taskId: number, userId: number): Promise<string> => {
  // Verify task belongs to user
  const verify = await pool.query(
    `SELECT st.*, c.name as course_name 
     FROM study_tasks st
     JOIN study_plans sp ON st.plan_id = sp.id
     LEFT JOIN courses c ON st.course_id = c.id
     WHERE st.id = $1 AND sp.user_id = $2`,
    [taskId, userId]
  );

  if (verify.rows.length === 0) {
    throw new Error('Task not found');
  }

  const task = verify.rows[0];

  // Return cached notes if exist
  if (task.ai_notes) {
    return task.ai_notes;
  }

  // Generate new notes
  const notes = await generateTopicNotes(task.topic, task.course_name);

  // Cache in database
  await pool.query(
    'UPDATE study_tasks SET ai_notes = $1 WHERE id = $2',
    [notes, taskId]
  );

  return notes;
};