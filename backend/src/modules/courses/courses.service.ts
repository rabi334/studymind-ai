import pool from '../../config/db';

export const addCourse = async (
  userId: number,
  name: string,
  exam_date: string,
  difficulty: 'easy' | 'medium' | 'hard'
) => {
  const result = await pool.query(
    'INSERT INTO courses (user_id, name, exam_date, difficulty) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, name, exam_date, difficulty]
  );
  return result.rows[0];
};

export const getUserCourses = async (userId: number) => {
  const result = await pool.query(
    'SELECT * FROM courses WHERE user_id = $1 ORDER BY exam_date ASC',
    [userId]
  );
  return result.rows;
};

export const deleteCourse = async (courseId: number, userId: number) => {
  const result = await pool.query(
    'DELETE FROM courses WHERE id = $1 AND user_id = $2 RETURNING *',
    [courseId, userId]
  );
  return result.rows[0];
};