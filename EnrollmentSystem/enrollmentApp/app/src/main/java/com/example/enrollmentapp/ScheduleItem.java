package com.example.enrollmentapp;

public class ScheduleItem {
    private String courseName;
    private String scheduleDay;
    private String scheduleTime;

    public ScheduleItem(String courseName, String scheduleDay, String scheduleTime) {
        this.courseName = courseName;
        this.scheduleDay = scheduleDay;
        this.scheduleTime = scheduleTime;
    }

    public String getCourseName() { return courseName; }
    public String getScheduleDay() { return scheduleDay; }
    public String getScheduleTime() { return scheduleTime; }
}

