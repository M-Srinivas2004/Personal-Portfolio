/**
 * NexaAI - Curated Developer Prompt Engineering Library
 * Categorized prompt templates engineered for modern web developers
 */

const PROMPT_LIBRARY = [
  {
    id: "react-hook",
    category: "Frontend",
    icon: "fa-brands fa-react",
    title: "Custom React Hook Generator",
    desc: "Generate a production-ready custom React Hook with TypeScript types, error handling, and usage example.",
    prompt: "Create a custom React Hook for [describe functionality, e.g., fetching data with cache, debouncing input, or managing local storage]. Include TypeScript types, cleanup logic, error handling, and a concise usage example in a React component."
  },
  {
    id: "css-glassmorphism",
    category: "Frontend",
    icon: "fa-brands fa-css3-alt",
    title: "Modern Glassmorphism Card",
    desc: "Generate responsive CSS and HTML for a sleek, glassmorphic UI card with subtle blur and hover effects.",
    prompt: "Generate a responsive modern Glassmorphism UI card component using semantic HTML5 and modern CSS3 (with backdrop-filter, subtle borders, and smooth hover elevation). Include full HTML and CSS."
  },
  {
    id: "sql-schema",
    category: "Backend",
    icon: "fa-solid fa-database",
    title: "PostgreSQL Relational Schema Designer",
    desc: "Design a normalized PostgreSQL schema with foreign keys, indexes, and constraints for a specific application.",
    prompt: "Design a production-grade PostgreSQL relational database schema for [describe application, e.g., an e-commerce order system or a project task manager]. Include table definitions with primary keys, foreign keys, constraints, performance indexes, and sample queries."
  },
  {
    id: "rest-api",
    category: "Backend",
    icon: "fa-brands fa-node-js",
    title: "Node.js & Express REST Endpoint",
    desc: "Build a robust Express.js REST API route with request validation, async error handling, and clean JSON responses.",
    prompt: "Write a clean Node.js and Express.js REST API router with full CRUD operations for [resource, e.g., /api/projects]. Include input validation, asynchronous error handling with try/catch, and standardized JSON response payloads."
  },
  {
    id: "python-scraper",
    category: "Python",
    icon: "fa-brands fa-python",
    title: "Python Data Processing Pipeline",
    desc: "Create a Python script for structured data extraction, cleaning, and transformation into JSON/CSV.",
    prompt: "Write a modular Python script to parse, clean, and validate data from [input format or API]. Implement proper typing, error logging, and export the processed dataset into formatted JSON."
  },
  {
    id: "code-optimizer",
    category: "Optimization",
    icon: "fa-solid fa-bolt",
    title: "Performance & Clean Code Refactor",
    desc: "Analyze and optimize a code snippet for Big-O time/space complexity, readability, and modern standards.",
    prompt: "Review and refactor the following code snippet for maximum performance, minimal time complexity, and clean architecture standards:\n\n```\n// Paste code here\n```\n\nExplain the specific optimizations made and compare before vs after."
  },
  {
    id: "security-audit",
    category: "Security",
    icon: "fa-solid fa-shield-halved",
    title: "Web App Security Checklist & Audit",
    desc: "Audit code or architecture for common web vulnerabilities (XSS, CSRF, SQL Injection, Auth issues).",
    prompt: "Perform a security audit checklist for a modern web application handling authentication and user inputs. Detail protections against XSS, CSRF, SQL Injection, insecure CORS, and rate limiting with code examples in JavaScript/Node.js."
  },
  {
    id: "explain-algo",
    category: "Algorithms",
    icon: "fa-solid fa-brain",
    title: "Algorithm Explainer & Visualizer",
    desc: "Break down complex computer science algorithms with step-by-step logic, edge cases, and code implementation.",
    prompt: "Explain [algorithm name, e.g., Dijkstra's Algorithm, Binary Search, or LRU Cache] in simple intuitive terms. Walk through step-by-step execution, state its Big-O time and space complexity, and provide a clean implementation in JavaScript/Python."
  }
];
