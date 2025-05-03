package com.example.enrollmentapp;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.recyclerview.widget.RecyclerView;
import android.util.Log;

import java.util.List;

public class AvailableClassesAdapter extends RecyclerView.Adapter<AvailableClassesAdapter.CourseViewHolder> {

    private List<Course> courses;
    private OnAddClickListener onAddClickListener;

    // Constructor for the adapter
    public AvailableClassesAdapter(List<Course> courses, OnAddClickListener onAddClickListener) {
        this.courses = courses;
        this.onAddClickListener = onAddClickListener;
    }

    // ViewHolder for each course item
    public static class CourseViewHolder extends RecyclerView.ViewHolder {
        TextView courseName;
        Button addButton;

        public CourseViewHolder(View itemView) {
            super(itemView);
            courseName = itemView.findViewById(R.id.courseName);
            addButton = itemView.findViewById(R.id.addButton);
        }
    }

    @Override
    public CourseViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.available_course, parent, false);
        return new CourseViewHolder(view);
    }

    @Override
    public void onBindViewHolder(CourseViewHolder holder, int position) {
        Course course = courses.get(position);
        Log.d("AddedCourseAdapter", "Binding course: " + course.getCourseName());
        holder.courseName.setText(course.getCourseName());

        // Set up the "Add" button click listener
        holder.addButton.setOnClickListener(v -> {
            if (onAddClickListener != null) {
                onAddClickListener.onAddClick(course);
            }
        });
    }

    // Return the total number of items
    @Override
    public int getItemCount() {
        return courses.size();
    }

    public interface OnAddClickListener {
        void onAddClick(Course course);
    }
}
