-- Add age and description fields to participants table
ALTER TABLE public.participants 
ADD COLUMN age INTEGER,
ADD COLUMN description TEXT;