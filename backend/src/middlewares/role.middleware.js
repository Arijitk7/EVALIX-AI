export const requireTeacher = (req, res, next) => {
  // We extract the role from the Supabase JWT metadata
  const role = req.user.user_metadata?.role;

  if (role !== 'TEACHER') {
    return res.status(403).json({ error: 'Forbidden: Only teachers can perform this action' });
  }
  
  next();
};

export const requireStudent = (req, res, next) => {
  const role = req.user.user_metadata?.role;

  if (role !== 'STUDENT') {
    return res.status(403).json({ error: 'Forbidden: Only students can perform this action' });
  }
  
  next();
};