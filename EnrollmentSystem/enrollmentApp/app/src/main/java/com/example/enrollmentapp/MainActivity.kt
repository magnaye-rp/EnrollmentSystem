package com.example.enrollmentapp

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.widget.Toast

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val student_id = intent.getStringExtra("student_id")
        val student_name = intent.getStringExtra("student_name")

        Toast.makeText(this, "Welcome $student_name!", Toast.LENGTH_LONG).show()
    }
}