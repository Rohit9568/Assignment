/**
 * Default SQL queries for tables in the application
 */
const DEFAULT_QUERIES = {
  // Generic default query
  default: "SELECT * FROM customers LIMIT 10;",
  
  // Table-specific queries
  categories: "SELECT * FROM categories ORDER BY category_id;",
  customers: "SELECT customer_id, company_name, contact_name, country FROM customers LIMIT 20;",
  employee_territories: "SELECT employee_id, territory_id FROM employee_territories;",
  employees: "SELECT employee_id, first_name, last_name, title, hire_date FROM employees;",
  order_details: "SELECT order_id, product_id, unit_price, quantity FROM order_details LIMIT 25;",
  orders: "SELECT order_id, customer_id, employee_id, order_date FROM orders LIMIT 20;",
  products: "SELECT product_id, product_name, category_id, unit_price FROM products ORDER BY product_name;",
  regions: "SELECT * FROM regions;",
  shippers: "SELECT * FROM shippers;",
  suppliers: "SELECT supplier_id, company_name, contact_name, country FROM suppliers;",
  territories: "SELECT * FROM territories ORDER BY region_id;",
};

export default DEFAULT_QUERIES; 