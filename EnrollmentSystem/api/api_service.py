from flask import Flask, request, jsonify
import mysql.connector
import hashlib
from datetime import date, timedelta
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

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
    password_hashed = hash_password(data['password'])

    db = get_db_connection()
    if db is None:
        return jsonify({"message": "Database connection failed!"}), 500

    cursor = db.cursor()
    try:
        cursor.execute(
            "SELECT student_id, student_name FROM students WHERE email = %s AND password = %s",
            (email, password_hashed)
        )
        user = cursor.fetchone()

        if user:
            # No need for db.commit() on SELECT
            cursor.close()
            db.close()
            return jsonify({
                "message": "Login successful!",
                "user_id": user[0],
                "user_name": user[1]
            }), 200
        else:
            cursor.close()
            db.close()
            return jsonify({"message": "Invalid credentials!"}), 401

    except mysql.connector.Error as err:
        print(f"Database query error: {err}")
        cursor.close()
        db.close()
        return jsonify({"message": "Database query failed!"}), 500

@app.route('/course_list', methods=['POST'])
def enrolled_courses():
    data = request.get_json()

    if not data or 'student_id' not in data:
        return jsonify({"message": "Invalid request data!"}), 400

    student_id = data['student_id']

    db = get_db_connection()
    if db is None:
        return jsonify({"message": "Database connection failed!"}), 500

    # fetch result set as dictionary
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("CALL GetStudentEnrollments(%s);", (student_id,))

        results = []
        while True:
            rows = cursor.fetchall()
            if rows:
                results.extend(rows)
            if not cursor.nextset():
                break

        cursor.close()
        db.close()
        print(results)
        if results:
            return jsonify({"message": "Data fetched", "data": results}), 200
        else:
            return jsonify({"message": "No enrollments found!"}), 404

    except mysql.connector.Error as err:
        print(f"Database query error: {err}")
        cursor.close()
        db.close()
        return jsonify({"message": "Database query failed!"}), 500

@app.route('/sched_list', methods=['POST'])
def schedule_list():
    data = request.get_json()

    if not data or 'student_id' not in data:
        return jsonify({"message": "Invalid request data!"}), 400

    student_id = data['student_id']

    db = get_db_connection()
    if db is None:
        return jsonify({"message": "Database connection failed!"}), 500

    # fetch result set as dictionary
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("CALL GetStudentSchedule(%s);", (student_id,))

        results = []
        while True:
            rows = cursor.fetchall()
            if rows:
                results.extend(rows)
            if not cursor.nextset():
                break

        cursor.close()
        db.close()

        if results:
            serialized_results = [serialize_row(row) for row in results]
            return jsonify({"message": "Data fetched", "data": serialized_results}), 200
        else:
            return jsonify({"message": "No enrollments found!"}), 404

    except mysql.connector.Error as err:
        print(f"Database query error: {err}")
        cursor.close()
        db.close()
        return jsonify({"message": "Database query failed!"}), 500

@app.route('/available_courses', methods=['POST'])
def fetch_courses():
    logging.info("Starting to fetch courses")
    data = request.get_json()

    if not data or "student_id" not in data:
        return jsonify({"message": "Invalid request data!"}), 400

    student_id = data["student_id"]
    logging.info(f"Student ID received: {student_id}")

    db = get_db_connection()
    if db is None:
        logging.error("Database connection failed!")
        return jsonify({"message": "Database connection failed!"}), 500

    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("CALL GetAvailableCourses(%s);", (student_id,))

        result = []
        while True:
            rows = cursor.fetchall()
            if rows:
                result.extend(rows)
            if not cursor.nextset():
                break

        cursor.close()
        db.close()

        logging.info(f"Results fetched: {result}")

        if result:
            serialized_results = [serialize_row(row) for row in result]
            return jsonify({"message": "Data fetched", "data": serialized_results}), 200
        else:
            return jsonify({"message": "No enrollments found!"}), 404

    except mysql.connector.Error as err:
        logging.error(f"Database query error: {err}")
        cursor.close()
        db.close()
        return jsonify({"message": "Database query failed!"}), 500

#for web app --v--
@app.route('/admin_login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data['username']
    password = hash_password(data['password'])

    # Get the database connection
    conn = get_db_connection()

    # Create a cursor from the connection
    cur = conn.cursor()

    # Execute the query
    cur.execute("SELECT * FROM admins WHERE user_name = %s AND password = %s", (username, password))

    # Fetch the result
    user = cur.fetchone()

    if user:
        print(user[0])  # Print the user_id (or any other info you need)

        return jsonify({"message": "Login successful!", "user_id": user[0]}), 200
    else:
        return jsonify({"message": "Invalid credentials!"}), 401

#for web app --v--
@app.route('/courses', methods=['GET'])
def list_courses():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM courses")
    courses = cur.fetchall()

    courses_list = [{"course_id": course[0], "course_name": course[1], "schedule": course[2], "capacity": course[3]} for
                    course in courses]
    return jsonify(courses_list), 200

@app.route('/enroll_courses', methods=['POST'])
def enroll_courses():
    data = request.get_json()
    student_id = data['student_id']
    course_ids = data['course_ids']

    conn = get_db_connection()
    cur = conn.cursor()

    for course_id in course_ids:
        cur.execute("SELECT capacity FROM courses WHERE course_id = %s", (course_id,))
        course = cur.fetchone()

        if course and course[0] > 0:
            cur.execute("""
                INSERT INTO enrollments (student_id, course_id, enrollment_date) 
                VALUES (%s, %s, CURDATE())
            """, (student_id, course_id))
            cur.execute("UPDATE courses SET capacity = capacity - 1 WHERE course_id = %s", (course_id,))
        else:
            conn.rollback()
            return jsonify({"message": f"Course {course_id} is full or invalid!"}), 400

    conn.commit()
    return jsonify({"message": "All courses enrolled successfully!"}), 200

@app.route('/stats')
def get_stats():

    conn = get_db_connection()
    cur1 = conn.cursor()
    cur2 = conn.cursor()
    cur3 = conn.cursor()

    cur1.execute("SELECT COUNT(*) FROM students;")
    total_courses = cur1.fetchone()

    cur2.execute("SELECT COUNT(*) FROM courses;")
    total_students = cur2.fetchone()

    cur3.execute("SELECT COUNT(*) FROM enrollments;")
    active_enrollments = cur3.fetchone()


    stats_data = {
        'totalStudents': total_students,
        'coursesOffered': total_courses,
        'activeEnrollments': active_enrollments
    }
    return jsonify(stats_data)

@app.route('/student_list')
def get_users():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 3, type=int)  # Default to 3 per page
    offset = (page - 1) * limit

    conn = get_db_connection()
    cur = conn.cursor()
    user_list = []

    # Fetch paginated students
    cur.execute("SELECT student_id, student_name, email FROM students LIMIT %s OFFSET %s", (limit, offset,))
    paginated_users = cur.fetchall()
    for user in paginated_users:
        user_list.append({
            'id': user[0],
            'name': user[1],
            'email': user[2],
            'role': "Student"
        })

    # Get total number of students (execute a separate query)
    cur.execute("SELECT COUNT(*) FROM students")
    total_students = cur.fetchone()[0]
    total_pages = (total_students + limit - 1) // limit

    conn.close()

    return jsonify({
        'users': user_list,
        'total_pages': total_pages,
        'current_page': page
    })

@app.route('/courses_list')
def get_courses():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 3, type=int)  # Default to 3 per page
    offset = (page - 1) * limit

    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Failed to connect to the database'}), 500

    cur = conn.cursor()
    course_list = []

    try:
        cur.execute("SELECT course_id, course_name, schedule_time, schedule_day, capacity FROM courses LIMIT %s OFFSET %s", (limit, offset,))
        paginated_courses = cur.fetchall()
        columns = [col[0] for col in cur.description] # Get column names

        for row in paginated_courses:
            course_dict = dict(zip(columns, row))
            schedule_timedelta = course_dict.get('schedule_time')
            formatted_time = ""
            if isinstance(schedule_timedelta, timedelta):
                total_seconds = int(schedule_timedelta.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                formatted_time = f"{hours:02}:{minutes:02}:{seconds:02}"
            else:
                formatted_time = str(course_dict.get('schedule_time', ''))

            course_list.append({
                'courseId': course_dict.get('course_id'),
                'courseName': course_dict.get('course_name'),
                'courseTime': formatted_time,
                'courseDay': course_dict.get('schedule_day'),
                'capacity': course_dict.get('capacity')
            })

        cur.execute("SELECT COUNT(*) FROM courses")
        total_courses = cur.fetchone()[0]
        total_pages = (total_courses + limit - 1) // limit

        conn.commit()
        return jsonify({
            'courses': course_list,
            'total_pages': total_pages,
            'current_page': page
        })

    except mysql.connector.Error as err:
        print(f"MySQL Error: {err}")
        conn.rollback()
        return jsonify({'error': f'Database error: {err}'}), 500

    finally:
        cur.close()
        conn.close()

@app.route('/analytics')
def dashboard_data():
    data_type = request.args.get('type')

    if not data_type:
        return jsonify({'error': 'Please provide type param: monthly_trend, course_ranking, or recent_enrollments'}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Failed to connect to the database'}), 500

    cur = conn.cursor(dictionary=True)

    if data_type == 'monthly_trend':
        cur.execute("""
            SELECT DATE_FORMAT(enrollment_date, '%Y-%m') AS month,
                   COUNT(*) AS total_enrollments
            FROM enrollments
            GROUP BY month
            ORDER BY month ASC;
        """)
        data = cur.fetchall()

    elif data_type == 'course_ranking':
        cur.execute("""
            SELECT c.course_id, c.course_name, COUNT(e.enrollment_id) AS total_enrollments
            FROM courses c
            LEFT JOIN enrollments e ON c.course_id = e.course_id
            GROUP BY c.course_id, c.course_name
            ORDER BY total_enrollments DESC;
        """)
        course_data = cur.fetchall()

    elif data_type == 'recent_enrollments':
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 5, type=int)
        offset = (page - 1) * limit

        cur.execute(f"""
            SELECT e.enrollment_id, s.student_name, c.course_name, e.enrollment_date
            FROM enrollments e
            JOIN students s ON e.student_id = s.student_id
            JOIN courses c ON e.course_id = c.course_id
            ORDER BY e.enrollment_date DESC, e.enrollment_id DESC
            LIMIT {limit} OFFSET {offset};
        """)
        enrollment_data = cur.fetchall()

    else:
        cur.close()
        conn.close()
        return jsonify({'error': 'Invalid type. Use: monthly_trend, course_ranking, or recent_enrollments'}), 400

    cur.close()
    conn.close()
    type = request.args.get('type')
    if type == 'monthly_trend':
        return jsonify(data)
    elif type == 'course_ranking':
        # ...
        return jsonify(course_data)
    elif type == 'recent_enrollments':
        # ...
        return jsonify(enrollment_data)
    else:
        return jsonify([])

@app.route('/enrollment_summary', methods=['POST'])
def enrollment_summary():
    data = request.get_json()

    if not data or 'student_id' not in data:
        return jsonify({"message": "Invalid request data!"}), 400

    student_id = data['student_id']
    db = get_db_connection()
    if db is None:
        return jsonify({"message": "Database connection failed!"}), 500

    cursor = db.cursor()

    try:
        # Total enrolled courses
        cursor.execute("""
            SELECT COUNT(*) 
            FROM enrollments 
            WHERE student_id = %s
        """, (student_id,))
        total_enrolled = cursor.fetchone()[0]

        # Unpaid courses using your stored procedure
        cursor.callproc('unpaidEnrollments', [student_id])

        unpaid_courses = 0
        for result in cursor.stored_results():
            unpaid_courses = result.fetchone()[0]  # Assuming your procedure returns COUNT(*)

        cursor.close()
        db.close()

        return jsonify({
            "message": "Summary fetched",
            "total_enrolled": total_enrolled,
            "unpaid_courses": unpaid_courses
        }), 200

    except mysql.connector.Error as err:
        print(f"Database query error: {err}")
        cursor.close()
        db.close()
        return jsonify({"message": "Database query failed!"}), 500

@app.route('/to_pay', methods=['POST'])
def listUnpaid():
    data = request.get_json()
    student_id = data['student_id']
    db = get_db_connection()
    cur = db.cursor()
    try:
        cur.callproc('listUnpaid', [student_id])
        unpaid_courses = []
        for result in cur.stored_results():
            unpaid_courses = result.fetchall()
        courses_list = [
            {
                "enrollment_id": course[0],
                "course_name": course[1],
                "enrollment_date": course[2]
            }
            for course in unpaid_courses
        ]
        return jsonify({
            'status': 'success',
            'unpaid_courses': courses_list
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

    finally:
        cur.close()
        db.close()


@app.route('/submit_payment', methods=['POST'])
def submit_payment():
    data = request.form

    # Extract the payment data
    enrollment_id = data['enrollment_id']
    amount = data['amount']

    # Store the payment in the database
    db = get_db_connection()
    cur = db.cursor()

    try:
        # Assuming you have a payment table to insert the payment record
        cur.execute("""
            INSERT INTO payments (enrollment_id, amount, payment_date)
            VALUES (%s, %s, CURDATE())
        """, (enrollment_id, amount))
        db.commit()

        return jsonify({"status": "success", "message": "Payment processed successfully!"})

    except Exception as e:
        db.rollback()  # In case of error, rollback the transaction
        return jsonify({"status": "error", "message": str(e)})

    finally:
        cur.close()
        db.close()


def serialize_row(row):
    serialized = {}
    for key, value in row.items():
        if isinstance(value, timedelta):
            # Convert time (timedelta) to HH:MM:SS string
            total_seconds = int(value.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            serialized[key] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        elif isinstance(value, date):
            # Convert date to YYYY-MM-DD string
            serialized[key] = value.isoformat()
        else:
            serialized[key] = value
    return serialized
if __name__ == '__main__':
    app.run(debug=True)
