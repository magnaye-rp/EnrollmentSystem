package com.example.enrollmentapp;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.DiffUtil;
import androidx.recyclerview.widget.ListAdapter;
import androidx.recyclerview.widget.RecyclerView;

public class AddedCourseAdapter extends ListAdapter<Course, AddedCourseAdapter.CourseViewHolder> {

    public AddedCourseAdapter() {
        super(new CourseDiffCallback());
    }

    public static class CourseViewHolder extends RecyclerView.ViewHolder {
        TextView name;

        public CourseViewHolder(View itemView) {
            super(itemView);
            name = itemView.findViewById(R.id.courseName);
        }
    }
    private static class CourseDiffCallback extends DiffUtil.ItemCallback<Course> {
        @Override
        public boolean areItemsTheSame(Course oldItem, Course newItem) {
            return false; // Force RecyclerView to treat each as new
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
        holder.name.setText(getItem(position).getCourseName()); // Use getItem() to access the course
    }
}
