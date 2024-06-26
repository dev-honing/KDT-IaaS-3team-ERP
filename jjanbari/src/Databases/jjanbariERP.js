// src/Databases/productInfo.js

const mysql = require('mysql2/promise');

const databaseName = 'jjanbariERP';
const tableUser = 'users';
const tableproducts = 'products';
const tableAnimalCategories = 'animal_categories';
const tableAgeCategories = 'age_categories';
const tableFunctionalCategories = 'functional_categories';
const tableAnimalProducts = 'animal_products';
const tableAgeProducts = 'age_products';
const tableFunctionalProducts = 'functional_products';
const tableCart = 'cart';

// 데이터베이스 연결 풀 생성
let pool = mysql.createPool({
  host: 'team3.c9kusawuiwxh.ap-northeast-2.rds.amazonaws.com',
  user: 'root',
  password: 'qwer1234',
  database: databaseName,
});

// 데이터베이스 초기화 함수
async function initializeDatabase() {
  try {
    // 데이터베이스 생성 쿼리 실행
    await pool.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);

    // 테이블 생성 쿼리 실행
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableUser} (
        user_num INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_pw VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL
      );
    `);

    // animal_categories 테이블 생성 쿼리
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableAnimalCategories} (
        animal_id INT PRIMARY KEY AUTO_INCREMENT,
        animal_name VARCHAR(255) NOT NULL
      );
    `);
    
    // age_categories 테이블 생성 쿼리
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableAgeCategories} (
        age_id INT PRIMARY KEY AUTO_INCREMENT,
        age_name VARCHAR(255) NOT NULL
      );
    `);
    
    // functional_categories 테이블 생성 쿼리
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableFunctionalCategories} (
        functional_id INT PRIMARY KEY AUTO_INCREMENT,
        functional_name VARCHAR(255) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableproducts} (
        product_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        quantity INT NOT NULL,
        img VARCHAR(255) NOT NULL,
        animal_id INT,
        age_id INT,
        functional_id INT,
        FOREIGN KEY (animal_id) REFERENCES animal_categories(animal_id) ON DELETE CASCADE,
        FOREIGN KEY (age_id) REFERENCES age_categories(age_id) ON DELETE CASCADE,
        FOREIGN KEY (functional_id) REFERENCES functional_categories(functional_id) ON DELETE CASCADE  
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableAnimalProducts} (
        product_id INT,
        animal_id INT,
        PRIMARY KEY (product_id, animal_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id),
        FOREIGN KEY (animal_id) REFERENCES animal_categories(animal_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableAgeProducts} (
        product_id INT,
        age_id INT,
        PRIMARY KEY (product_id, age_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id),
        FOREIGN KEY (age_id) REFERENCES age_categories(age_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableFunctionalProducts} (
        product_id INT,
        functional_id INT,
        PRIMARY KEY (product_id, functional_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id),
        FOREIGN KEY (functional_id) REFERENCES functional_categories(functional_id)
      );
    `);

    //payment 테이블 생성 쿼리
    await pool.query(`
    CREATE TABLE IF NOT EXISTS payment (
      product_id int NOT NULL AUTO_INCREMENT,
      date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      sold int NOT NULL,
      PRIMARY KEY (product_id),
      FOREIGN KEY (sold) REFERENCES products (product_id)
    );
  `);

    //cart 테이블 생성 쿼리
    await pool.query(`CREATE TABLE IF NOT EXISTS cart (
      cart_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255),
      product_id INT,
      name VARCHAR(255),
      quantity INT,
      price DECIMAL,
      FOREIGN KEY (product_id) REFERENCES products(product_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    );
  `);

    // 기본 카테고리 추가
    // 동물 카테고리에 항목 추가
    await pool.query(`
    INSERT INTO ${tableAnimalCategories} (animal_name) VALUES ('강아지'), ('고양이')
    `);

    // 나이대 카테고리에 항목 추가
    await pool.query(`
    INSERT INTO ${tableAgeCategories} (age_name) VALUES ('성견'), ('성묘'), ('유아견'), ('유아묘')
    `);

    // 기능성 카테고리에 항목 추가
    await pool.query(`
    INSERT INTO ${tableFunctionalCategories} (functional_name) VALUES ('일반'), ('칼슘'), ('단백질')
    `);

    console.log(
      `초기화 완료!\n - DB명: ${databaseName}\n - TABLE명: ${tableUser}, ${tableproducts}, ${tableAnimalCategories}, ${tableAgeCategories}, ${tableFunctionalCategories}, ${tableAnimalProducts}, ${tableAgeProducts}, ${tableFunctionalProducts},${tableCart}`
    );
  } catch (error) {
    console.error('초기화 실패: ', error.message);
  }
}

// 데이터베이스 초기화 함수 호출
initializeDatabase();

// productQuery 함수 정의
async function jjanbariQuery(sql, params) {
  // 쿼리 실행 전에 연결 상태 체크
  if (pool._closed) {
    console.error('Pool is closed. Reconnecting...');
    // 연결이 닫혔다면 새로운 연결 생성
    pool = mysql.createPool({
      host: 'team3.c9kusawuiwxh.ap-northeast-2.rds.amazonaws.com',
      user: 'root',
      password: 'qwer1234',
      database: databaseName,
    });
  }

  const [rows] = await pool.execute(sql, params);
  return rows;
}

// query 함수 내보내기
module.exports = { jjanbariQuery };
