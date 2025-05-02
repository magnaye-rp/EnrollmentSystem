package com.example.enrollmentapp;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.recyclerview.widget.RecyclerView;

import java.text.SimpleDateFormat;
import java.util.List;

public class EnrollmentAdapter extends RecyclerView.Adapter<EnrollmentAdapter.ViewHolder> {
    private List<Enrollment> enrollmentList;

    public EnrollmentAdapter(List<Enrollment> enrollmentList) {
        this.enrollmentList = enrollmentList;
    }

    // ViewHolder class to hold the views
    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView txtCourseName, txtDate;

        public ViewHolder(View itemView) {
            super(itemView);
            txtCourseName = itemView.findViewById(R.id.txtCourseName);
            txtDate = itemView.findViewById(R.id.txtEnrollmentDate);
        }
    }

    @Override
    public EnrollmentAdapter.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        // Inflate the layout for each row
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.row_enrollment, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(EnrollmentAdapter.ViewHolder holder, int position) {
        Enrollment enrollment = enrollmentList.get(position);

        // Set course name
        holder.txtCourseName.setText(enrollment.getCourse_name());

        // Format enrollment date (example: "04/30/2025")
        String formattedDate = formatDate(enrollment.getEnrollment_date());
        holder.txtDate.setText(formattedDate);
    }

    @Override
    public int getItemCount() {
        return enrollmentList.size();
    }

    // Format the date to a more readable format
    private String formatDate(String date) {
        try {
            // Example format: 2025-04-30 -> 04/30/2025
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd");
            SimpleDateFormat outputFormat = new SimpleDateFormat("MM/dd/yyyy");
            return outputFormat.format(inputFormat.parse(date));
        } catch (Exception e) {
            e.printStackTrace();
            return date; // Return original date in case of parsing error
        }
    }
}
