package com.example.enrollmentapp

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import com.example.enrollmentapp.MainActivity
import com.example.enrollmentapp.databinding.ActivityEnrollmentBinding
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout


class EnrollmentActivity : AppCompatActivity() {
    private lateinit var binding: ActivityEnrollmentBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val student_id = intent.getStringExtra("student_id")
        val student_name = intent.getStringExtra("student_name")

        Toast.makeText(this, "Welcome $student_name!", Toast.LENGTH_LONG).show()

        binding = ActivityEnrollmentBinding.inflate(layoutInflater)
        setContentView(binding.root)
        //swipe up refresh


    }
}