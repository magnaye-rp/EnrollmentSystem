from flask import Flask, request, jsonify
import mysql.connector
import hashlib

app = Flask(__name__) # Initialize the Flask app

def get_db_connection():
    try:
        mydb = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='EnrollmentSystem',
            port=3308
        )
        return mydb
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        return None

def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


@app.route('/login', methods=['POST'])
def student_login():
    data = request.get_json()

    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Invalid request data!"}), 400

    email = data['email']
    password = data['password']

    db = get_db_connection()
    if db is None:
        return jsonify({"message": "Database connection failed!"}), 500

    cursor = db.cursor()
    try:
        cursor.execute("SELECT student_id, student_name FROM students WHERE email = %s AND password = %s", (email, password))
        user = cursor.fetchone()

        if user:
            db.commit()
            cursor.close()
            db.close()
            return jsonify({"message": "Login successful!", "user_id": user[0], "user_name": user[1]}), 200
        else:
            cursor.close()
            db.close()
            return jsonify({"message": "Invalid credentials!"}), 401
    except mysql.connector.Error as err:
        print(f"Database query error: {err}")
        cursor.close()
        db.close()
        return jsonify({"message": "Database query failed!"}), 500

@app.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data['user_name']
    password = hash_password(data['password'])

    cur = get_db_connection()
    cur.execute("SELECT * FROM admins WHERE user_name = %s AND password = %s", (username, password))
    user = cur.fetchone()

    if user:
        return jsonify({"message": "Login successful!", "user_id": user[0]}), 200
    else:
        return jsonify({"message": "Invalid credentials!"}), 401


@app.route('/courses', methods=['GET'])
def list_courses():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM courses")
    courses = cur.fetchall()

    courses_list = [{"course_id": course[0], "course_name": course[1], "schedule": course[2], "capacity": course[3]} for
                    course in courses]
    return jsonify(courses_list), 200


@app.route('/enroll', methods=['POST'])
def enroll():
    data = request.get_json()
    student_id = data['student_id']
    course_id = data['course_id']

    cur = mysql.connection.cursor()
    cur.execute("SELECT capacity FROM courses WHERE id = %s", (course_id,))
    course = cur.fetchone()

    if course and course[0] > 0:
        cur.execute("INSERT INTO enrollments (student_id, course_id) VALUES (%s, %s)", (student_id, course_id))
        cur.execute("UPDATE courses SET capacity = capacity - 1 WHERE id = %s", (course_id,))
        mysql.connection.commit()
        return jsonify({"message": "Enrollment successful!"}), 200
    else:
        return jsonify({"message": "Course is full or invalid!"}), 400


if __name__ == '__main__':
    app.run(debug=True)
