-- ==============================================================================
-- College Notes Sharing Platform - Supabase PostgreSQL Schema
-- ==============================================================================

-- 1. Enable pgcrypto extension for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-running (CASCADE removes foreign keys)
-- DROP TABLE IF EXISTS notes CASCADE;
-- DROP TABLE IF EXISTS subjects CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------------------------------------------
-- Table: users
-- Roles: 'student', 'admin'
-- Passwords must ALWAYS be hashed with bcrypt before storing.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    prn VARCHAR(9) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_users_prn CHECK (prn ~ '^[0-9]{9}$')
);

-- Index on 9-digit PRN for fast lookups during authentication
CREATE INDEX IF NOT EXISTS idx_users_prn ON users(prn);

-- Migration helper if updating an existing users table:
-- ALTER TABLE users DROP COLUMN IF EXISTS email;
-- ALTER TABLE users ALTER COLUMN prn SET NOT NULL;
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_prn;
-- ALTER TABLE users ADD CONSTRAINT chk_users_prn CHECK (prn ~ '^[0-9]{9}$');
-- CREATE INDEX IF NOT EXISTS idx_users_prn ON users(prn);

-- ------------------------------------------------------------------------------
-- Table: subjects
-- Tracks academic subjects categorized by department and semester (1 to 8)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    semester INT NOT NULL CHECK (semester >= 1 AND semester <= 8),
    department VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_subjects_curriculum UNIQUE (name, semester, department)
);

-- Indexes for filtering subjects by semester and department
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subjects_curriculum ON subjects(name, semester, department);


-- ------------------------------------------------------------------------------
-- Table: notes
-- Stores metadata and Supabase Storage paths for uploaded PDF notes.
-- Note: Binary PDF files are stored in Supabase Storage, NOT in this table.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    semester INT NOT NULL CHECK (semester >= 1 AND semester <= 8),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    downloads INT NOT NULL DEFAULT 0 CHECK (downloads >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Foreign Key and Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_notes_subject_id ON notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_semester ON notes(semester);
CREATE INDEX IF NOT EXISTS idx_notes_uploaded_by ON notes(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- Optional: Full-Text Search index on Title and Description
CREATE INDEX IF NOT EXISTS idx_notes_search ON notes USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));

-- ------------------------------------------------------------------------------
-- Supabase Storage Setup (Run in SQL Editor or via Supabase Dashboard)
-- ------------------------------------------------------------------------------
-- Create a private bucket called 'notes' for storing PDFs:
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for 'notes' bucket (allows backend uploads and downloads):
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow insert for notes bucket' AND tablename = 'objects') THEN
        CREATE POLICY "Allow insert for notes bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'notes');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow select for notes bucket' AND tablename = 'objects') THEN
        CREATE POLICY "Allow select for notes bucket" ON storage.objects FOR SELECT USING (bucket_id = 'notes');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow update for notes bucket' AND tablename = 'objects') THEN
        CREATE POLICY "Allow update for notes bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'notes');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow delete for notes bucket' AND tablename = 'objects') THEN
        CREATE POLICY "Allow delete for notes bucket" ON storage.objects FOR DELETE USING (bucket_id = 'notes');
    END IF;
END $$;

-- unauthenticated files without a signed URL generated by this API.

-- ------------------------------------------------------------------------------
-- Complete Standard Curriculum Seed Data (9 Branches • Semesters 1 to 8)
-- ------------------------------------------------------------------------------
INSERT INTO subjects (name, semester, department) VALUES
-- First Year Common Subjects (Semesters 1 & 2 for all branches)
('Engineering Mathematics I', 1, 'Common Engineering'),
('Engineering Physics', 1, 'Common Engineering'),
('Basic Electrical Engineering', 1, 'Common Engineering'),
('Programming for Problem Solving', 1, 'Common Engineering'),
('Engineering Graphics & Design', 1, 'Common Engineering'),
('Engineering Mathematics II', 2, 'Common Engineering'),
('Engineering Chemistry', 2, 'Common Engineering'),
('Basic Electronics Engineering', 2, 'Common Engineering'),
('Engineering Mechanics', 2, 'Common Engineering'),
('Workshop Practice', 2, 'Common Engineering'),

-- 1. Computer Engineering (Semesters 3-8)
('Data Structures and Algorithms', 3, 'Computer Engineering'),
('Discrete Mathematics', 3, 'Computer Engineering'),
('Digital Electronics & Logic Design', 3, 'Computer Engineering'),
('Computer Organization & Architecture', 3, 'Computer Engineering'),
('Database Management Systems', 4, 'Computer Engineering'),
('Operating Systems', 4, 'Computer Engineering'),
('Theory of Computation', 4, 'Computer Engineering'),
('Software Engineering', 4, 'Computer Engineering'),
('Computer Networks', 5, 'Computer Engineering'),
('Design and Analysis of Algorithms', 5, 'Computer Engineering'),
('Web Technology', 5, 'Computer Engineering'),
('Cyber Security & Forensics', 5, 'Computer Engineering'),
('Artificial Intelligence', 6, 'Computer Engineering'),
('Cloud Computing', 6, 'Computer Engineering'),
('Systems Programming & Compiler Construction', 6, 'Computer Engineering'),
('Information & Storage Management', 6, 'Computer Engineering'),
('Distributed Systems', 7, 'Computer Engineering'),
('Machine Learning', 7, 'Computer Engineering'),
('Mobile Application Development', 7, 'Computer Engineering'),
('Big Data Analytics', 7, 'Computer Engineering'),
('Deep Learning', 8, 'Computer Engineering'),
('High Performance Computing', 8, 'Computer Engineering'),
('Blockchain Technology', 8, 'Computer Engineering'),

-- 2. Mechanical Engineering (Semesters 3-8)
('Thermodynamics', 3, 'Mechanical Engineering'),
('Strength of Materials', 3, 'Mechanical Engineering'),
('Material Science and Metallurgy', 3, 'Mechanical Engineering'),
('Manufacturing Processes I', 3, 'Mechanical Engineering'),
('Fluid Mechanics', 4, 'Mechanical Engineering'),
('Kinematics of Machinery', 4, 'Mechanical Engineering'),
('Applied Thermodynamics', 4, 'Mechanical Engineering'),
('Machine Drawing & Solid Modeling', 4, 'Mechanical Engineering'),
('Heat Transfer', 5, 'Mechanical Engineering'),
('Dynamics of Machinery', 5, 'Mechanical Engineering'),
('Metrology and Quality Control', 5, 'Mechanical Engineering'),
('Turbo Machines', 5, 'Mechanical Engineering'),
('Design of Machine Elements', 6, 'Mechanical Engineering'),
('Mechatronics & IoT', 6, 'Mechanical Engineering'),
('Internal Combustion Engines', 6, 'Mechanical Engineering'),
('CAD/CAM/CAE', 6, 'Mechanical Engineering'),
('Refrigeration and Air Conditioning', 7, 'Mechanical Engineering'),
('Finite Element Analysis', 7, 'Mechanical Engineering'),
('Automobile Engineering', 7, 'Mechanical Engineering'),
('Operations Research', 7, 'Mechanical Engineering'),
('Robotics and Automation', 8, 'Mechanical Engineering'),
('Power Plant Engineering', 8, 'Mechanical Engineering'),
('Industrial Engineering & Management', 8, 'Mechanical Engineering'),

-- 3. Civil Engineering (Semesters 3-8)
('Surveying', 3, 'Civil Engineering'),
('Building Technology & Materials', 3, 'Civil Engineering'),
('Strength of Materials', 3, 'Civil Engineering'),
('Fluid Mechanics I', 3, 'Civil Engineering'),
('Structural Analysis I', 4, 'Civil Engineering'),
('Concrete Technology', 4, 'Civil Engineering'),
('Geotechnical Engineering', 4, 'Civil Engineering'),
('Environmental Engineering I', 4, 'Civil Engineering'),
('Design of Steel Structures', 5, 'Civil Engineering'),
('Hydrology and Water Resources Engineering', 5, 'Civil Engineering'),
('Transportation Engineering', 5, 'Civil Engineering'),
('Structural Analysis II', 5, 'Civil Engineering'),
('Design of Reinforced Concrete Structures', 6, 'Civil Engineering'),
('Foundation Engineering', 6, 'Civil Engineering'),
('Construction Management', 6, 'Civil Engineering'),
('Highway & Pavement Design', 6, 'Civil Engineering'),
('Earthquake Engineering', 7, 'Civil Engineering'),
('Quantity Surveying & Valuation', 7, 'Civil Engineering'),
('Irrigation Engineering', 7, 'Civil Engineering'),
('Town Planning & Architecture', 7, 'Civil Engineering'),
('Advanced Structural Design', 8, 'Civil Engineering'),
('Construction Equipment & Automation', 8, 'Civil Engineering'),
('Bridge Engineering', 8, 'Civil Engineering'),

-- 4. Electrical Engineering (Semesters 3-8)
('Electrical Circuit Analysis', 3, 'Electrical Engineering'),
('Electrical Machines I', 3, 'Electrical Engineering'),
('Analog and Digital Electronics', 3, 'Electrical Engineering'),
('Electromagnetic Fields', 3, 'Electrical Engineering'),
('Electrical Machines II', 4, 'Electrical Engineering'),
('Power Systems I (Generation & Transmission)', 4, 'Electrical Engineering'),
('Control Systems', 4, 'Electrical Engineering'),
('Signals and Systems', 4, 'Electrical Engineering'),
('Power Electronics', 5, 'Electrical Engineering'),
('Power Systems II (Analysis & Stability)', 5, 'Electrical Engineering'),
('Microprocessors and Microcontrollers', 5, 'Electrical Engineering'),
('High Voltage Engineering', 5, 'Electrical Engineering'),
('Electric Drives and Control', 6, 'Electrical Engineering'),
('Power System Protection & Switchgear', 6, 'Electrical Engineering'),
('Renewable Energy Systems', 6, 'Electrical Engineering'),
('Digital Signal Processing for Electrical', 6, 'Electrical Engineering'),
('Smart Grids and Distribution Automation', 7, 'Electrical Engineering'),
('Utilization of Electrical Energy', 7, 'Electrical Engineering'),
('PLC and SCADA Systems', 7, 'Electrical Engineering'),
('Electric Vehicle Technology', 7, 'Electrical Engineering'),
('HVDC and FACTS', 8, 'Electrical Engineering'),
('Power Quality Management', 8, 'Electrical Engineering'),
('Energy Audit & Management', 8, 'Electrical Engineering'),

-- 5. Electronics & Telecommunication (ENTC) (Semesters 3-8)
('Electronic Devices and Circuits', 3, 'Electronics & Telecommunication (ENTC)'),
('Network Theory', 3, 'Electronics & Telecommunication (ENTC)'),
('Digital Logic Design', 3, 'Electronics & Telecommunication (ENTC)'),
('Signals and Systems', 3, 'Electronics & Telecommunication (ENTC)'),
('Integrated Circuits & Applications', 4, 'Electronics & Telecommunication (ENTC)'),
('Analog Communication', 4, 'Electronics & Telecommunication (ENTC)'),
('Microprocessor Architecture', 4, 'Electronics & Telecommunication (ENTC)'),
('Electromagnetic Engineering', 4, 'Electronics & Telecommunication (ENTC)'),
('Digital Communication', 5, 'Electronics & Telecommunication (ENTC)'),
('Control Systems Engineering', 5, 'Electronics & Telecommunication (ENTC)'),
('Digital Signal Processing', 5, 'Electronics & Telecommunication (ENTC)'),
('Embedded System Design', 5, 'Electronics & Telecommunication (ENTC)'),
('VLSI Design', 6, 'Electronics & Telecommunication (ENTC)'),
('Antenna and Wave Propagation', 6, 'Electronics & Telecommunication (ENTC)'),
('Optical Fiber Communication', 6, 'Electronics & Telecommunication (ENTC)'),
('Microcontrollers and RTOS', 6, 'Electronics & Telecommunication (ENTC)'),
('Microwave and Radar Engineering', 7, 'Electronics & Telecommunication (ENTC)'),
('Cellular and Mobile Communications', 7, 'Electronics & Telecommunication (ENTC)'),
('Internet of Things (IoT) Networks', 7, 'Electronics & Telecommunication (ENTC)'),
('RF Circuit Design', 7, 'Electronics & Telecommunication (ENTC)'),
('Satellite Communication & Navigation', 8, 'Electronics & Telecommunication (ENTC)'),
('Wireless Sensor Networks', 8, 'Electronics & Telecommunication (ENTC)'),
('Biomedical Signal Processing', 8, 'Electronics & Telecommunication (ENTC)'),

-- 6. Artificial Intelligence & Data Science (AIDS) (Semesters 3-8)
('Data Structures with Python', 3, 'Artificial Intelligence & Data Science (AIDS)'),
('Discrete Mathematics & Logic', 3, 'Artificial Intelligence & Data Science (AIDS)'),
('Foundations of Artificial Intelligence', 3, 'Artificial Intelligence & Data Science (AIDS)'),
('Computer Architecture & Organization', 3, 'Artificial Intelligence & Data Science (AIDS)'),
('Database Management Systems', 4, 'Artificial Intelligence & Data Science (AIDS)'),
('Probability and Statistics for Data Science', 4, 'Artificial Intelligence & Data Science (AIDS)'),
('Operating Systems & System Programming', 4, 'Artificial Intelligence & Data Science (AIDS)'),
('Machine Learning Foundations', 4, 'Artificial Intelligence & Data Science (AIDS)'),
('Supervised & Unsupervised Learning', 5, 'Artificial Intelligence & Data Science (AIDS)'),
('Data Warehousing and Data Mining', 5, 'Artificial Intelligence & Data Science (AIDS)'),
('Computer Vision Basics', 5, 'Artificial Intelligence & Data Science (AIDS)'),
('Big Data Engineering & Hadoop/Spark', 5, 'Artificial Intelligence & Data Science (AIDS)'),
('Deep Learning Techniques', 6, 'Artificial Intelligence & Data Science (AIDS)'),
('Natural Language Processing', 6, 'Artificial Intelligence & Data Science (AIDS)'),
('AI Ethics, Governance & Law', 6, 'Artificial Intelligence & Data Science (AIDS)'),
('Cloud Computing for Data Science', 6, 'Artificial Intelligence & Data Science (AIDS)'),
('Reinforcement Learning', 7, 'Artificial Intelligence & Data Science (AIDS)'),
('MLOps: Machine Learning Operations', 7, 'Artificial Intelligence & Data Science (AIDS)'),
('Business Intelligence & Analytics', 7, 'Artificial Intelligence & Data Science (AIDS)'),
('Predictive Analytics and Modeling', 7, 'Artificial Intelligence & Data Science (AIDS)'),
('Generative AI and Large Language Models', 8, 'Artificial Intelligence & Data Science (AIDS)'),
('Autonomous Intelligent Systems', 8, 'Artificial Intelligence & Data Science (AIDS)'),
('Data Visualization & Storytelling', 8, 'Artificial Intelligence & Data Science (AIDS)'),

-- 7. Artificial Intelligence & Machine Learning (AIML) (Semesters 3-8)
('Data Structures and Algorithms', 3, 'Artificial Intelligence & Machine Learning (AIML)'),
('Linear Algebra & Calculus for ML', 3, 'Artificial Intelligence & Machine Learning (AIML)'),
('Principles of Artificial Intelligence', 3, 'Artificial Intelligence & Machine Learning (AIML)'),
('Object-Oriented Programming with Python', 3, 'Artificial Intelligence & Machine Learning (AIML)'),
('Machine Learning Algorithms & Models', 4, 'Artificial Intelligence & Machine Learning (AIML)'),
('Database Systems for AI', 4, 'Artificial Intelligence & Machine Learning (AIML)'),
('Probability, Random Processes & Statistics', 4, 'Artificial Intelligence & Machine Learning (AIML)'),
('Design and Analysis of Algorithms', 4, 'Artificial Intelligence & Machine Learning (AIML)'),
('Deep Learning Architectures', 5, 'Artificial Intelligence & Machine Learning (AIML)'),
('Mathematical Optimization in Machine Learning', 5, 'Artificial Intelligence & Machine Learning (AIML)'),
('Computer Vision & Image Processing', 5, 'Artificial Intelligence & Machine Learning (AIML)'),
('Pattern Recognition and Feature Extraction', 5, 'Artificial Intelligence & Machine Learning (AIML)'),
('Natural Language Processing and Transformers', 6, 'Artificial Intelligence & Machine Learning (AIML)'),
('Speech and Audio Processing', 6, 'Artificial Intelligence & Machine Learning (AIML)'),
('Neural Networks & Deep Learning', 6, 'Artificial Intelligence & Machine Learning (AIML)'),
('Model Deployment and MLOps', 6, 'Artificial Intelligence & Machine Learning (AIML)'),
('Reinforcement Learning and Game AI', 7, 'Artificial Intelligence & Machine Learning (AIML)'),
('Robotics and Intelligent Agents', 7, 'Artificial Intelligence & Machine Learning (AIML)'),
('Cognitive Computing & Expert Systems', 7, 'Artificial Intelligence & Machine Learning (AIML)'),
('Explainable AI (XAI) & Interpretability', 7, 'Artificial Intelligence & Machine Learning (AIML)'),
('Generative Models (GANs, VAEs & Diffusion)', 8, 'Artificial Intelligence & Machine Learning (AIML)'),
('Edge AI and TinyML', 8, 'Artificial Intelligence & Machine Learning (AIML)'),
('AI in Healthcare and Bioinformatics', 8, 'Artificial Intelligence & Machine Learning (AIML)'),

-- 8. Data Science (DS) (Semesters 3-8)
('Data Structures and Algorithms', 3, 'Data Science (DS)'),
('Exploratory Data Analysis and Statistics', 3, 'Data Science (DS)'),
('Applied Linear Algebra for Data Science', 3, 'Data Science (DS)'),
('SQL and Relational Database Engineering', 3, 'Data Science (DS)'),
('Statistical Inference and Modeling', 4, 'Data Science (DS)'),
('NoSQL and Distributed Databases', 4, 'Data Science (DS)'),
('Machine Learning for Data Science I', 4, 'Data Science (DS)'),
('Data Wrangling, Cleaning and ETL Pipelines', 4, 'Data Science (DS)'),
('Big Data Technologies (Hadoop & Apache Spark)', 5, 'Data Science (DS)'),
('Advanced Machine Learning II', 5, 'Data Science (DS)'),
('Data Visualization and Dashboards (Tableau/PowerBI)', 5, 'Data Science (DS)'),
('Cloud Analytics and Data Lakes', 5, 'Data Science (DS)'),
('Deep Learning for Data Science', 6, 'Data Science (DS)'),
('Time Series Analysis and Forecasting', 6, 'Data Science (DS)'),
('Text Analytics and NLP', 6, 'Data Science (DS)'),
('Feature Engineering and Selection', 6, 'Data Science (DS)'),
('High-Dimensional Data Analysis', 7, 'Data Science (DS)'),
('Graph Analytics and Network Science', 7, 'Data Science (DS)'),
('Data Privacy, Security and Compliance', 7, 'Data Science (DS)'),
('Real-Time Stream Processing (Kafka/Flink)', 7, 'Data Science (DS)'),
('Scalable Machine Learning on Distributed Systems', 8, 'Data Science (DS)'),
('Automated Machine Learning (AutoML)', 8, 'Data Science (DS)'),
('Data Science Capstone Project', 8, 'Data Science (DS)'),

-- 9. Information Technology (IT) (Semesters 3-8)
('Data Structures and Analysis', 3, 'Information Technology (IT)'),
('Computer Architecture and Logic Design', 3, 'Information Technology (IT)'),
('Discrete Structures', 3, 'Information Technology (IT)'),
('Object-Oriented Programming with Java', 3, 'Information Technology (IT)'),
('Database Management Systems', 4, 'Information Technology (IT)'),
('Operating Systems Principles', 4, 'Information Technology (IT)'),
('Full Stack Web Development', 4, 'Information Technology (IT)'),
('Computer Networks and Protocols', 4, 'Information Technology (IT)'),
('Software Engineering & Agile Methodologies', 5, 'Information Technology (IT)'),
('Information and Network Security', 5, 'Information Technology (IT)'),
('Cloud Computing Infrastructure', 5, 'Information Technology (IT)'),
('Mobile Application Architecture', 5, 'Information Technology (IT)'),
('DevOps and Continuous Delivery', 6, 'Information Technology (IT)'),
('Enterprise Systems and Microservices', 6, 'Information Technology (IT)'),
('Business Analytics & Data Mining', 6, 'Information Technology (IT)'),
('Advanced Computer Networks', 6, 'Information Technology (IT)'),
('Distributed and Cloud Native Systems', 7, 'Information Technology (IT)'),
('Information Retrieval and Search Engines', 7, 'Information Technology (IT)'),
('Blockchain and Decentralized Applications', 7, 'Information Technology (IT)'),
('Cyber Forensics and Incident Response', 7, 'Information Technology (IT)'),
('IT Strategy, Governance and Management', 8, 'Information Technology (IT)'),
('Internet of Everything (IoE)', 8, 'Information Technology (IT)'),
('IT Infrastructure Design and Automation', 8, 'Information Technology (IT)')
ON CONFLICT (name, semester, department) DO NOTHING;


