/**
 * Standard curriculum subjects for the 9 allowed engineering branches (Semesters 1-8)
 */

export const DEFAULT_SUBJECTS = [
  // ==========================================
  // First Year B.Tech (Common Engineering - All Branches)
  // NEP Scheme (Batch 2025-2026 w.e.f. A.Y. 2025-26)
  // ==========================================
  // Semester 1 (Group A & Group B)
  { name: 'Mathematics-I', semester: 1, department: 'Common Engineering' },
  { name: 'Mathematics-I Tutorial', semester: 1, department: 'Common Engineering' },
  { name: 'Structured Programming using C', semester: 1, department: 'Common Engineering' },
  { name: 'Structured Programming using C Laboratory', semester: 1, department: 'Common Engineering' },
  { name: 'Physics', semester: 1, department: 'Common Engineering' },
  { name: 'Physics Laboratory & Tutorial', semester: 1, department: 'Common Engineering' },
  { name: 'Computational Engineering Mechanics', semester: 1, department: 'Common Engineering' },
  { name: 'Computational Engineering Mechanics Laboratory', semester: 1, department: 'Common Engineering' },
  { name: 'Basic Electrical Engineering & Digital Electronics', semester: 1, department: 'Common Engineering' },
  { name: 'Basic Electrical Engineering & Digital Electronics Laboratory & Tutorial', semester: 1, department: 'Common Engineering' },
  { name: 'Health and Wellness- Mind and Body Management', semester: 1, department: 'Common Engineering' },
  { name: 'Chemistry', semester: 1, department: 'Common Engineering' },
  { name: 'Chemistry Laboratory & Tutorial', semester: 1, department: 'Common Engineering' },
  { name: 'Engineering Graphics', semester: 1, department: 'Common Engineering' },
  { name: 'Engineering Graphics Laboratory', semester: 1, department: 'Common Engineering' },
  { name: 'Effective Communication Skills', semester: 1, department: 'Common Engineering' },
  { name: 'Effective Communication Skills Laboratory', semester: 1, department: 'Common Engineering' },
  { name: 'Workshop Practices', semester: 1, department: 'Common Engineering' },
  { name: 'Indian Knowledge System', semester: 1, department: 'Common Engineering' },

  // Semester 2 (Alternate Groups / Common FE)
  { name: 'Engineering Mathematics II', semester: 2, department: 'Common Engineering' },
  { name: 'Structured Programming using C', semester: 2, department: 'Common Engineering' },
  { name: 'Structured Programming using C Laboratory', semester: 2, department: 'Common Engineering' },
  { name: 'Physics', semester: 2, department: 'Common Engineering' },
  { name: 'Physics Laboratory & Tutorial', semester: 2, department: 'Common Engineering' },
  { name: 'Computational Engineering Mechanics', semester: 2, department: 'Common Engineering' },
  { name: 'Computational Engineering Mechanics Laboratory', semester: 2, department: 'Common Engineering' },
  { name: 'Basic Electrical Engineering & Digital Electronics', semester: 2, department: 'Common Engineering' },
  { name: 'Basic Electrical Engineering & Digital Electronics Laboratory & Tutorial', semester: 2, department: 'Common Engineering' },
  { name: 'Health and Wellness- Mind and Body Management', semester: 2, department: 'Common Engineering' },
  { name: 'Chemistry', semester: 2, department: 'Common Engineering' },
  { name: 'Chemistry Laboratory & Tutorial', semester: 2, department: 'Common Engineering' },
  { name: 'Engineering Graphics', semester: 2, department: 'Common Engineering' },
  { name: 'Engineering Graphics Laboratory', semester: 2, department: 'Common Engineering' },
  { name: 'Effective Communication Skills', semester: 2, department: 'Common Engineering' },
  { name: 'Effective Communication Skills Laboratory', semester: 2, department: 'Common Engineering' },
  { name: 'Workshop Practices', semester: 2, department: 'Common Engineering' },
  { name: 'Indian Knowledge System', semester: 2, department: 'Common Engineering' },

  // ==========================================
  // 1. Computer Engineering (Semesters 3-8)
  // RCP23 NEP Scheme (w.e.f. Year 2026-27)
  // ==========================================
  // Semester 3
  { name: 'Data Structures', semester: 3, department: 'Computer Engineering' },
  { name: 'Data Structures Laboratory', semester: 3, department: 'Computer Engineering' },
  { name: 'Database Management System', semester: 3, department: 'Computer Engineering' },
  { name: 'Database Management System Laboratory', semester: 3, department: 'Computer Engineering' },
  { name: 'Computer Networks', semester: 3, department: 'Computer Engineering' },
  { name: 'Python Programming Laboratory', semester: 3, department: 'Computer Engineering' },
  { name: 'Computational Mathematics', semester: 3, department: 'Computer Engineering' },
  { name: 'Python Programming for Data-Driven Applications', semester: 3, department: 'Computer Engineering' },
  { name: 'Product Life Cycle Management', semester: 3, department: 'Computer Engineering' },
  { name: 'Management Information System', semester: 3, department: 'Computer Engineering' },
  { name: 'Operations Research', semester: 3, department: 'Computer Engineering' },
  { name: 'Personal Finance Management', semester: 3, department: 'Computer Engineering' },
  { name: 'Public Systems and Policies', semester: 3, department: 'Computer Engineering' },
  { name: 'Fundamentals of Biomedical Instruments', semester: 3, department: 'Computer Engineering' },
  { name: 'IPR and Patenting', semester: 3, department: 'Computer Engineering' },
  { name: 'Entrepreneurship and Startup Ecosystem', semester: 3, department: 'Computer Engineering' },
  { name: 'Semester Project-I', semester: 3, department: 'Computer Engineering' },
  { name: 'Design Thinking Laboratory', semester: 3, department: 'Computer Engineering' },
  { name: 'Universal Human Values', semester: 3, department: 'Computer Engineering' },
  { name: 'Community Engagement Service', semester: 3, department: 'Computer Engineering' },

  // Semester 4
  { name: 'Operating Systems', semester: 4, department: 'Computer Engineering' },
  { name: 'Operating Systems Laboratory', semester: 4, department: 'Computer Engineering' },
  { name: 'Analysis of Algorithms', semester: 4, department: 'Computer Engineering' },
  { name: 'Analysis of Algorithms Laboratory', semester: 4, department: 'Computer Engineering' },
  { name: 'Artificial Intelligence', semester: 4, department: 'Computer Engineering' },
  { name: 'Artificial Intelligence Laboratory', semester: 4, department: 'Computer Engineering' },
  { name: 'Algebraic Number Theory', semester: 4, department: 'Computer Engineering' },
  { name: 'Prompt Engineering for AI Applications', semester: 4, department: 'Computer Engineering' },
  { name: 'Project Management', semester: 4, department: 'Computer Engineering' },
  { name: 'Cyber Security, Policies and Laws', semester: 4, department: 'Computer Engineering' },
  { name: 'Advanced Operations Research', semester: 4, department: 'Computer Engineering' },
  { name: 'Corporate Finance Management', semester: 4, department: 'Computer Engineering' },
  { name: 'Corporate Social Responsibility', semester: 4, department: 'Computer Engineering' },
  { name: 'Bioinformatics', semester: 4, department: 'Computer Engineering' },
  { name: 'Human Resource Management', semester: 4, department: 'Computer Engineering' },
  { name: 'Digital Marketing Management', semester: 4, department: 'Computer Engineering' },
  { name: 'Logistics and Supply Chain Management', semester: 4, department: 'Computer Engineering' },
  { name: 'Semester Project-II', semester: 4, department: 'Computer Engineering' },
  { name: 'Professional and Business Communication Tutorial', semester: 4, department: 'Computer Engineering' },
  { name: 'Economics and Financial Management', semester: 4, department: 'Computer Engineering' },

  // Semester 5
  { name: 'Machine Learning', semester: 5, department: 'Computer Engineering' },
  { name: 'Machine Learning Laboratory', semester: 5, department: 'Computer Engineering' },
  { name: 'Automata Theory and Compiler Design', semester: 5, department: 'Computer Engineering' },
  { name: 'Automata Theory and Compiler Design Laboratory', semester: 5, department: 'Computer Engineering' },
  { name: 'Business Intelligence and Analytics', semester: 5, department: 'Computer Engineering' },
  { name: 'Business Intelligence and Analytics Laboratory', semester: 5, department: 'Computer Engineering' },
  { name: 'Web Programming Laboratory', semester: 5, department: 'Computer Engineering' },
  { name: 'Advanced Algorithms', semester: 5, department: 'Computer Engineering' },
  { name: 'Advanced Algorithms Laboratory', semester: 5, department: 'Computer Engineering' },
  { name: 'Statistical Modeling', semester: 5, department: 'Computer Engineering' },
  { name: 'Statistical Modeling Laboratory', semester: 5, department: 'Computer Engineering' },
  { name: 'Enterprise Data Systems', semester: 5, department: 'Computer Engineering' },
  { name: 'Enterprise Data Systems Laboratory', semester: 5, department: 'Computer Engineering' },
  { name: 'Computer Graphics', semester: 5, department: 'Computer Engineering' },
  { name: 'Computer Graphics Laboratory', semester: 5, department: 'Computer Engineering' },
  { name: 'Information and Cyber Security', semester: 5, department: 'Computer Engineering' },
  { name: 'Information and Cyber Security Laboratory', semester: 5, department: 'Computer Engineering' },
  { name: 'Semester Project - III', semester: 5, department: 'Computer Engineering' },
  { name: 'Constitution of India', semester: 5, department: 'Computer Engineering' },
  { name: 'Mastering Neural Networks', semester: 5, department: 'Computer Engineering' },

  // Semester 6
  { name: 'Deep Learning', semester: 6, department: 'Computer Engineering' },
  { name: 'Deep Learning Laboratory', semester: 6, department: 'Computer Engineering' },
  { name: 'Blockchain and Crypto Technology', semester: 6, department: 'Computer Engineering' },
  { name: 'Blockchain and Crypto Technology Laboratory', semester: 6, department: 'Computer Engineering' },
  { name: 'Software Engineering and DevOps Laboratory', semester: 6, department: 'Computer Engineering' },
  { name: 'Big Data Analytics', semester: 6, department: 'Computer Engineering' },
  { name: 'Big Data Analytics Laboratory', semester: 6, department: 'Computer Engineering' },
  { name: 'UI/UX Design', semester: 6, department: 'Computer Engineering' },
  { name: 'UI/UX Design Laboratory', semester: 6, department: 'Computer Engineering' },
  { name: 'Virtual Reality', semester: 6, department: 'Computer Engineering' },
  { name: 'Virtual Reality Laboratory', semester: 6, department: 'Computer Engineering' },
  { name: 'Computer Vision', semester: 6, department: 'Computer Engineering' },
  { name: 'Computer Vision Laboratory', semester: 6, department: 'Computer Engineering' },
  { name: 'Development Frameworks', semester: 6, department: 'Computer Engineering' },
  { name: 'Development Frameworks Laboratory', semester: 6, department: 'Computer Engineering' },
  { name: 'High Performance Computing', semester: 6, department: 'Computer Engineering' },
  { name: 'High Performance Computing Laboratory', semester: 6, department: 'Computer Engineering' },
  { name: 'Ethical Hacking and Digital Forensics', semester: 6, department: 'Computer Engineering' },
  { name: 'Ethical Hacking and Digital Forensics Laboratory', semester: 6, department: 'Computer Engineering' },
  { name: 'Project Stage - I', semester: 6, department: 'Computer Engineering' },
  { name: 'Environmental Studies', semester: 6, department: 'Computer Engineering' },
  { name: 'Generative Artificial Intelligence', semester: 6, department: 'Computer Engineering' },

  // Semester 7
  { name: 'Natural Language Processing', semester: 7, department: 'Computer Engineering' },
  { name: 'Natural Language Processing Laboratory', semester: 7, department: 'Computer Engineering' },
  { name: 'Agentic AI', semester: 7, department: 'Computer Engineering' },
  { name: 'Agentic AI Laboratory', semester: 7, department: 'Computer Engineering' },
  { name: 'Distributed Computing', semester: 7, department: 'Computer Engineering' },
  { name: 'Distributed Computing Laboratory', semester: 7, department: 'Computer Engineering' },
  { name: 'Metaverse', semester: 7, department: 'Computer Engineering' },
  { name: 'Metaverse Laboratory', semester: 7, department: 'Computer Engineering' },
  { name: 'Social Network Analysis', semester: 7, department: 'Computer Engineering' },
  { name: 'Social Network Analysis Laboratory', semester: 7, department: 'Computer Engineering' },
  { name: 'Virtual Infrastructure Systems', semester: 7, department: 'Computer Engineering' },
  { name: 'Virtual Infrastructure Systems Laboratory', semester: 7, department: 'Computer Engineering' },
  { name: 'Internet of Everything', semester: 7, department: 'Computer Engineering' },
  { name: 'Internet of Everything Laboratory', semester: 7, department: 'Computer Engineering' },
  { name: 'Vulnerability Assessment and Penetration Testing', semester: 7, department: 'Computer Engineering' },
  { name: 'Research Ecosystem', semester: 7, department: 'Computer Engineering' },
  { name: 'Project Stage-II', semester: 7, department: 'Computer Engineering' },
  { name: 'Disaster Management and Preparedness', semester: 7, department: 'Computer Engineering' },
  { name: 'AI for Language Generation and Understanding', semester: 7, department: 'Computer Engineering' },

  // Semester 8
  { name: 'Quantum Computing', semester: 8, department: 'Computer Engineering' },
  { name: 'Human Computer Interaction', semester: 8, department: 'Computer Engineering' },
  { name: 'Geographic Information System', semester: 8, department: 'Computer Engineering' },
  { name: 'NPTEL / SWAYAM Course', semester: 8, department: 'Computer Engineering' },
  { name: 'Internship (OJT) cum Project', semester: 8, department: 'Computer Engineering' },
  { name: 'Multi-Agent Systems', semester: 8, department: 'Computer Engineering' },

  // 2. Mechanical Engineering (Semesters 3-8)
  { name: 'Thermodynamics', semester: 3, department: 'Mechanical Engineering' },
  { name: 'Strength of Materials', semester: 3, department: 'Mechanical Engineering' },
  { name: 'Material Science and Metallurgy', semester: 3, department: 'Mechanical Engineering' },
  { name: 'Manufacturing Processes I', semester: 3, department: 'Mechanical Engineering' },

  { name: 'Fluid Mechanics', semester: 4, department: 'Mechanical Engineering' },
  { name: 'Kinematics of Machinery', semester: 4, department: 'Mechanical Engineering' },
  { name: 'Applied Thermodynamics', semester: 4, department: 'Mechanical Engineering' },
  { name: 'Machine Drawing & Solid Modeling', semester: 4, department: 'Mechanical Engineering' },

  { name: 'Heat Transfer', semester: 5, department: 'Mechanical Engineering' },
  { name: 'Dynamics of Machinery', semester: 5, department: 'Mechanical Engineering' },
  { name: 'Metrology and Quality Control', semester: 5, department: 'Mechanical Engineering' },
  { name: 'Turbo Machines', semester: 5, department: 'Mechanical Engineering' },

  { name: 'Design of Machine Elements', semester: 6, department: 'Mechanical Engineering' },
  { name: 'Mechatronics & IoT', semester: 6, department: 'Mechanical Engineering' },
  { name: 'Internal Combustion Engines', semester: 6, department: 'Mechanical Engineering' },
  { name: 'CAD/CAM/CAE', semester: 6, department: 'Mechanical Engineering' },

  { name: 'Refrigeration and Air Conditioning', semester: 7, department: 'Mechanical Engineering' },
  { name: 'Finite Element Analysis', semester: 7, department: 'Mechanical Engineering' },
  { name: 'Automobile Engineering', semester: 7, department: 'Mechanical Engineering' },
  { name: 'Operations Research', semester: 7, department: 'Mechanical Engineering' },

  { name: 'Robotics and Automation', semester: 8, department: 'Mechanical Engineering' },
  { name: 'Power Plant Engineering', semester: 8, department: 'Mechanical Engineering' },
  { name: 'Industrial Engineering & Management', semester: 8, department: 'Mechanical Engineering' },

  // 3. Civil Engineering (Semesters 3-8)
  { name: 'Surveying', semester: 3, department: 'Civil Engineering' },
  { name: 'Building Technology & Materials', semester: 3, department: 'Civil Engineering' },
  { name: 'Strength of Materials', semester: 3, department: 'Civil Engineering' },
  { name: 'Fluid Mechanics I', semester: 3, department: 'Civil Engineering' },

  { name: 'Structural Analysis I', semester: 4, department: 'Civil Engineering' },
  { name: 'Concrete Technology', semester: 4, department: 'Civil Engineering' },
  { name: 'Geotechnical Engineering', semester: 4, department: 'Civil Engineering' },
  { name: 'Environmental Engineering I', semester: 4, department: 'Civil Engineering' },

  { name: 'Design of Steel Structures', semester: 5, department: 'Civil Engineering' },
  { name: 'Hydrology and Water Resources Engineering', semester: 5, department: 'Civil Engineering' },
  { name: 'Transportation Engineering', semester: 5, department: 'Civil Engineering' },
  { name: 'Structural Analysis II', semester: 5, department: 'Civil Engineering' },

  { name: 'Design of Reinforced Concrete Structures', semester: 6, department: 'Civil Engineering' },
  { name: 'Foundation Engineering', semester: 6, department: 'Civil Engineering' },
  { name: 'Construction Management', semester: 6, department: 'Civil Engineering' },
  { name: 'Highway & Pavement Design', semester: 6, department: 'Civil Engineering' },

  { name: 'Earthquake Engineering', semester: 7, department: 'Civil Engineering' },
  { name: 'Quantity Surveying & Valuation', semester: 7, department: 'Civil Engineering' },
  { name: 'Irrigation Engineering', semester: 7, department: 'Civil Engineering' },
  { name: 'Town Planning & Architecture', semester: 7, department: 'Civil Engineering' },

  { name: 'Advanced Structural Design', semester: 8, department: 'Civil Engineering' },
  { name: 'Construction Equipment & Automation', semester: 8, department: 'Civil Engineering' },
  { name: 'Bridge Engineering', semester: 8, department: 'Civil Engineering' },

  // 4. Electrical Engineering (Semesters 3-8)
  { name: 'Electrical Circuit Analysis', semester: 3, department: 'Electrical Engineering' },
  { name: 'Electrical Machines I', semester: 3, department: 'Electrical Engineering' },
  { name: 'Analog and Digital Electronics', semester: 3, department: 'Electrical Engineering' },
  { name: 'Electromagnetic Fields', semester: 3, department: 'Electrical Engineering' },

  { name: 'Electrical Machines II', semester: 4, department: 'Electrical Engineering' },
  { name: 'Power Systems I (Generation & Transmission)', semester: 4, department: 'Electrical Engineering' },
  { name: 'Control Systems', semester: 4, department: 'Electrical Engineering' },
  { name: 'Signals and Systems', semester: 4, department: 'Electrical Engineering' },

  { name: 'Power Electronics', semester: 5, department: 'Electrical Engineering' },
  { name: 'Power Systems II (Analysis & Stability)', semester: 5, department: 'Electrical Engineering' },
  { name: 'Microprocessors and Microcontrollers', semester: 5, department: 'Electrical Engineering' },
  { name: 'High Voltage Engineering', semester: 5, department: 'Electrical Engineering' },

  { name: 'Electric Drives and Control', semester: 6, department: 'Electrical Engineering' },
  { name: 'Power System Protection & Switchgear', semester: 6, department: 'Electrical Engineering' },
  { name: 'Renewable Energy Systems', semester: 6, department: 'Electrical Engineering' },
  { name: 'Digital Signal Processing for Electrical', semester: 6, department: 'Electrical Engineering' },

  { name: 'Smart Grids and Distribution Automation', semester: 7, department: 'Electrical Engineering' },
  { name: 'Utilization of Electrical Energy', semester: 7, department: 'Electrical Engineering' },
  { name: 'PLC and SCADA Systems', semester: 7, department: 'Electrical Engineering' },
  { name: 'Electric Vehicle Technology', semester: 7, department: 'Electrical Engineering' },

  { name: 'HVDC and FACTS', semester: 8, department: 'Electrical Engineering' },
  { name: 'Power Quality Management', semester: 8, department: 'Electrical Engineering' },
  { name: 'Energy Audit & Management', semester: 8, department: 'Electrical Engineering' },

  // 5. Electronics & Telecommunication (ENTC) (Semesters 3-8)
  { name: 'Electronic Devices and Circuits', semester: 3, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Network Theory', semester: 3, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Digital Logic Design', semester: 3, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Signals and Systems', semester: 3, department: 'Electronics & Telecommunication (ENTC)' },

  { name: 'Integrated Circuits & Applications', semester: 4, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Analog Communication', semester: 4, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Microprocessor Architecture', semester: 4, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Electromagnetic Engineering', semester: 4, department: 'Electronics & Telecommunication (ENTC)' },

  { name: 'Digital Communication', semester: 5, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Control Systems Engineering', semester: 5, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Digital Signal Processing', semester: 5, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Embedded System Design', semester: 5, department: 'Electronics & Telecommunication (ENTC)' },

  { name: 'VLSI Design', semester: 6, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Antenna and Wave Propagation', semester: 6, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Optical Fiber Communication', semester: 6, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Microcontrollers and RTOS', semester: 6, department: 'Electronics & Telecommunication (ENTC)' },

  { name: 'Microwave and Radar Engineering', semester: 7, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Cellular and Mobile Communications', semester: 7, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Internet of Things (IoT) Networks', semester: 7, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'RF Circuit Design', semester: 7, department: 'Electronics & Telecommunication (ENTC)' },

  { name: 'Satellite Communication & Navigation', semester: 8, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Wireless Sensor Networks', semester: 8, department: 'Electronics & Telecommunication (ENTC)' },
  { name: 'Biomedical Signal Processing', semester: 8, department: 'Electronics & Telecommunication (ENTC)' },

  // 6. Artificial Intelligence & Data Science (AIDS) (Semesters 3-8)
  { name: 'Data Structures with Python', semester: 3, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Discrete Mathematics & Logic', semester: 3, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Foundations of Artificial Intelligence', semester: 3, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Computer Architecture & Organization', semester: 3, department: 'Artificial Intelligence & Data Science (AIDS)' },

  { name: 'Database Management Systems', semester: 4, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Probability and Statistics for Data Science', semester: 4, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Operating Systems & System Programming', semester: 4, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Machine Learning Foundations', semester: 4, department: 'Artificial Intelligence & Data Science (AIDS)' },

  { name: 'Supervised & Unsupervised Learning', semester: 5, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Data Warehousing and Data Mining', semester: 5, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Computer Vision Basics', semester: 5, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Big Data Engineering & Hadoop/Spark', semester: 5, department: 'Artificial Intelligence & Data Science (AIDS)' },

  { name: 'Deep Learning Techniques', semester: 6, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Natural Language Processing', semester: 6, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'AI Ethics, Governance & Law', semester: 6, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Cloud Computing for Data Science', semester: 6, department: 'Artificial Intelligence & Data Science (AIDS)' },

  { name: 'Reinforcement Learning', semester: 7, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'MLOps: Machine Learning Operations', semester: 7, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Business Intelligence & Analytics', semester: 7, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Predictive Analytics and Modeling', semester: 7, department: 'Artificial Intelligence & Data Science (AIDS)' },

  { name: 'Generative AI and Large Language Models', semester: 8, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Autonomous Intelligent Systems', semester: 8, department: 'Artificial Intelligence & Data Science (AIDS)' },
  { name: 'Data Visualization & Storytelling', semester: 8, department: 'Artificial Intelligence & Data Science (AIDS)' },

  // 7. Artificial Intelligence & Machine Learning (AIML) (Semesters 3-8)
  { name: 'Data Structures and Algorithms', semester: 3, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Linear Algebra & Calculus for ML', semester: 3, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Principles of Artificial Intelligence', semester: 3, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Object-Oriented Programming with Python', semester: 3, department: 'Artificial Intelligence & Machine Learning (AIML)' },

  { name: 'Machine Learning Algorithms & Models', semester: 4, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Database Systems for AI', semester: 4, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Probability, Random Processes & Statistics', semester: 4, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Design and Analysis of Algorithms', semester: 4, department: 'Artificial Intelligence & Machine Learning (AIML)' },

  { name: 'Deep Learning Architectures', semester: 5, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Mathematical Optimization in Machine Learning', semester: 5, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Computer Vision & Image Processing', semester: 5, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Pattern Recognition and Feature Extraction', semester: 5, department: 'Artificial Intelligence & Machine Learning (AIML)' },

  { name: 'Natural Language Processing and Transformers', semester: 6, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Speech and Audio Processing', semester: 6, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Neural Networks & Deep Learning', semester: 6, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Model Deployment and MLOps', semester: 6, department: 'Artificial Intelligence & Machine Learning (AIML)' },

  { name: 'Reinforcement Learning and Game AI', semester: 7, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Robotics and Intelligent Agents', semester: 7, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Cognitive Computing & Expert Systems', semester: 7, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Explainable AI (XAI) & Interpretability', semester: 7, department: 'Artificial Intelligence & Machine Learning (AIML)' },

  { name: 'Generative Models (GANs, VAEs & Diffusion)', semester: 8, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'Edge AI and TinyML', semester: 8, department: 'Artificial Intelligence & Machine Learning (AIML)' },
  { name: 'AI in Healthcare and Bioinformatics', semester: 8, department: 'Artificial Intelligence & Machine Learning (AIML)' },

  // 8. Data Science (DS) (Semesters 3-8)
  { name: 'Data Structures and Algorithms', semester: 3, department: 'Data Science (DS)' },
  { name: 'Exploratory Data Analysis and Statistics', semester: 3, department: 'Data Science (DS)' },
  { name: 'Applied Linear Algebra for Data Science', semester: 3, department: 'Data Science (DS)' },
  { name: 'SQL and Relational Database Engineering', semester: 3, department: 'Data Science (DS)' },

  { name: 'Statistical Inference and Modeling', semester: 4, department: 'Data Science (DS)' },
  { name: 'NoSQL and Distributed Databases', semester: 4, department: 'Data Science (DS)' },
  { name: 'Machine Learning for Data Science I', semester: 4, department: 'Data Science (DS)' },
  { name: 'Data Wrangling, Cleaning and ETL Pipelines', semester: 4, department: 'Data Science (DS)' },

  { name: 'Big Data Technologies (Hadoop & Apache Spark)', semester: 5, department: 'Data Science (DS)' },
  { name: 'Advanced Machine Learning II', semester: 5, department: 'Data Science (DS)' },
  { name: 'Data Visualization and Dashboards (Tableau/PowerBI)', semester: 5, department: 'Data Science (DS)' },
  { name: 'Cloud Analytics and Data Lakes', semester: 5, department: 'Data Science (DS)' },

  { name: 'Deep Learning for Data Science', semester: 6, department: 'Data Science (DS)' },
  { name: 'Time Series Analysis and Forecasting', semester: 6, department: 'Data Science (DS)' },
  { name: 'Text Analytics and NLP', semester: 6, department: 'Data Science (DS)' },
  { name: 'Feature Engineering and Selection', semester: 6, department: 'Data Science (DS)' },

  { name: 'High-Dimensional Data Analysis', semester: 7, department: 'Data Science (DS)' },
  { name: 'Graph Analytics and Network Science', semester: 7, department: 'Data Science (DS)' },
  { name: 'Data Privacy, Security and Compliance', semester: 7, department: 'Data Science (DS)' },
  { name: 'Real-Time Stream Processing (Kafka/Flink)', semester: 7, department: 'Data Science (DS)' },

  { name: 'Scalable Machine Learning on Distributed Systems', semester: 8, department: 'Data Science (DS)' },
  { name: 'Automated Machine Learning (AutoML)', semester: 8, department: 'Data Science (DS)' },
  { name: 'Data Science Capstone Project', semester: 8, department: 'Data Science (DS)' },

  // 9. Information Technology (IT) (Semesters 3-8)
  { name: 'Data Structures and Analysis', semester: 3, department: 'Information Technology (IT)' },
  { name: 'Computer Architecture and Logic Design', semester: 3, department: 'Information Technology (IT)' },
  { name: 'Discrete Structures', semester: 3, department: 'Information Technology (IT)' },
  { name: 'Object-Oriented Programming with Java', semester: 3, department: 'Information Technology (IT)' },

  { name: 'Database Management Systems', semester: 4, department: 'Information Technology (IT)' },
  { name: 'Operating Systems Principles', semester: 4, department: 'Information Technology (IT)' },
  { name: 'Full Stack Web Development', semester: 4, department: 'Information Technology (IT)' },
  { name: 'Computer Networks and Protocols', semester: 4, department: 'Information Technology (IT)' },

  { name: 'Software Engineering & Agile Methodologies', semester: 5, department: 'Information Technology (IT)' },
  { name: 'Information and Network Security', semester: 5, department: 'Information Technology (IT)' },
  { name: 'Cloud Computing Infrastructure', semester: 5, department: 'Information Technology (IT)' },
  { name: 'Mobile Application Architecture', semester: 5, department: 'Information Technology (IT)' },

  { name: 'DevOps and Continuous Delivery', semester: 6, department: 'Information Technology (IT)' },
  { name: 'Enterprise Systems and Microservices', semester: 6, department: 'Information Technology (IT)' },
  { name: 'Business Analytics & Data Mining', semester: 6, department: 'Information Technology (IT)' },
  { name: 'Advanced Computer Networks', semester: 6, department: 'Information Technology (IT)' },

  { name: 'Distributed and Cloud Native Systems', semester: 7, department: 'Information Technology (IT)' },
  { name: 'Information Retrieval and Search Engines', semester: 7, department: 'Information Technology (IT)' },
  { name: 'Blockchain and Decentralized Applications', semester: 7, department: 'Information Technology (IT)' },
  { name: 'Cyber Forensics and Incident Response', semester: 7, department: 'Information Technology (IT)' },

  { name: 'IT Strategy, Governance and Management', semester: 8, department: 'Information Technology (IT)' },
  { name: 'Internet of Everything (IoE)', semester: 8, department: 'Information Technology (IT)' },
  { name: 'IT Infrastructure Design and Automation', semester: 8, department: 'Information Technology (IT)' },
];
