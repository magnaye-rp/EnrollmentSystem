package com.example.enrollmentapp

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.widget.Toast

//api service connection
import okhttp3.*
import org.json.JSONObject
import java.io.IOException
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import android.content.Intent
import com.example.enrollmentapp.LoginActivity
import com.example.enrollmentapp.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val student_id = intent.getStringExtra("student_id")
        val student_name = intent.getStringExtra("student_name")

        Toast.makeText(this, "Welcome $student_name!", Toast.LENGTH_LONG).show()

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Button click listener
        binding.floatingActionButton.setOnClickListener {

            val intent = Intent(this@MainActivity, EnrollmentActivity::class.java)
            startActivity(intent)

        }
    }
}