package com.example.enrollmentapp;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.DiffUtil;
import androidx.recyclerview.widget.ListAdapter;
import androidx.recyclerview.widget.RecyclerView;

public class AddedCourseAdapter extends ListAdapter<Course, AddedCourseAdapter.CourseViewHolder> {

    // Create an interface for the cancel button click
    public interface OnCancelClickListener {
        void onCancelClick(Course course);
    }

    private final OnCancelClickListener onCancelClickListener;

    // Constructor where you pass the listener
    public AddedCourseAdapter(OnCancelClickListener onCancelClickListener) {
        super(new CourseDiffCallback());
        this.onCancelClickListener = onCancelClickListener;
    }

    public static class CourseViewHolder extends RecyclerView.ViewHolder {
        TextView name;
        TextView sched;
        Button cancelButton; // Reference to the cancel button

        public CourseViewHolder(View itemView) {
            super(itemView);
            name = itemView.findViewById(R.id.addCourseName);
            sched = itemView.findViewById(R.id.addedSchedule);
            cancelButton = itemView.findViewById(R.id.cancelButton); // Bind the cancel button
        }
    }

    private static class CourseDiffCallback extends DiffUtil.ItemCallback<Course> {
        @Override
        public boolean areItemsTheSame(Course oldItem, Course newItem) {
            return oldItem.getCourseId() == newItem.getCourseId();
        }

        @Override
        public boolean areContentsTheSame(Course oldItem, Course newItem) {
            return oldItem.equals(newItem);
        }
    }

    @NonNull
    @Override
    public CourseViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_added, parent, false);
        return new CourseViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CourseViewHolder holder, int position) {
        Course course = getItem(position);
        holder.name.setText(course.getCourseName());

        String schedule = course.getScheduleDay() + " " + course.getScheduleTime();
        holder.sched.setText(schedule);

        // Set up the cancel button click listener
        holder.cancelButton.setOnClickListener(v -> {
            // Trigger the cancel action through the listener
            if (onCancelClickListener != null) {
                onCancelClickListener.onCancelClick(course);
            }
        });
    }
}

