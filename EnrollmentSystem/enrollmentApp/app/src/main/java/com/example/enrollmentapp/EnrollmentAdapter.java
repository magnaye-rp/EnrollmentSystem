package com.example.enrollmentapp;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.recyclerview.widget.RecyclerView;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

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

    public static String formatDate(String dateStr) {
        try {
            // Input format example: "Wed, 30 Apr 2025 00:00:00 GMT"
            String inputPattern = "EEE, dd MMM yyyy HH:mm:ss zzz";
            SimpleDateFormat inputFormat = new SimpleDateFormat(inputPattern, Locale.ENGLISH);

            // Desired output format
            String outputPattern = "MMMM dd, yyyy"; // e.g., April 30, 2025
            SimpleDateFormat outputFormat = new SimpleDateFormat(outputPattern, Locale.ENGLISH);

            Date date = inputFormat.parse(dateStr);
            return outputFormat.format(date);
        } catch (ParseException e) {
            e.printStackTrace();
            return dateStr; // Return the original string if parsing fails
        }
    }


}
