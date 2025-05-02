package com.example.enrollmentapp;

public class Enrollment {
    private String course_name;
    private String enrollment_date;

    // Constructor with parameters
    public Enrollment(String course_name, String enrollment_date) {
        this.course_name = course_name;
        this.enrollment_date = enrollment_date;
    }

    // Getter and setter methods
    public String getCourse_name() { return course_name; }
    public void setCourse_name(String course_name) { this.course_name = course_name; }

    public String getEnrollment_date() { return enrollment_date; }
    public void setEnrollment_date(String enrollment_date) { this.enrollment_date = enrollment_date; }
}
