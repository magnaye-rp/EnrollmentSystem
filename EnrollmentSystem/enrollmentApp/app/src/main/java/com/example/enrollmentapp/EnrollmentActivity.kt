package com.example.enrollmentapp

import android.app.DownloadManager
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import com.example.enrollmentapp.MainActivity
import com.example.enrollmentapp.databinding.ActivityEnrollmentBinding
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.MutableLiveData
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import android.view.LayoutInflater
import android.view.View
import android.widget.Button
import androidx.lifecycle.ViewModelProvider


import android.view.ViewGroup
import android.widget.TextView
import android.util.Log


import okhttp3.Call
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Request
import okhttp3.Callback
import okhttp3.Response
import org.json.JSONObject
import java.io.IOException
import org.json.JSONArray


class EnrollmentActivity : AppCompatActivity() {
    private lateinit var binding: ActivityEnrollmentBinding
    private lateinit var viewModel: CoursesViewModel
    private lateinit var addedCoursesAdapter: AddedCourseAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val student_id = intent.getStringExtra("student_id")
        val student_name = intent.getStringExtra("student_name")

        binding = ActivityEnrollmentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this).get(CoursesViewModel::class.java)

        // Setup adapter and RecyclerViews
        setupRecyclerViews()

        // Observe added courses
        viewModel.addedCourses.observe(this) { addedCourses ->
            Log.d("EnrollmentActivity", "Observed courses: $addedCourses")
            addedCoursesAdapter.submitList(addedCourses)
        }

        // Load available courses
        if (student_id != null) {
            loadAvailableCourses(student_id)
        }

        // Button to go back to the main activity
        binding.button2.setOnClickListener {
            val intent = Intent(this@EnrollmentActivity, MainActivity::class.java)
            intent.putExtra("studentId", student_id)
            intent.putExtra("studentName", student_name)
            startActivity(intent)
        }

        // Button to enroll the student
        binding.button3.setOnClickListener {
            student_id?.let { id ->
                enrollStudent(id)
            }
        }
    }

    private fun setupRecyclerViews() {
        addedCoursesAdapter = AddedCourseAdapter()
        binding.recyclerViewToEnroll.layoutManager = LinearLayoutManager(this)
        binding.recyclerViewToEnroll.adapter = addedCoursesAdapter

        binding.recyclerViewUnenrolled.layoutManager = LinearLayoutManager(this)
    }

    private fun loadAvailableCourses(s_id: String) {
        val client = OkHttpClient()
        val json = JSONObject().put("student_id", s_id)
        val mediaType = "application/json; charset=utf-8".toMediaType()
        val body: RequestBody = json.toString().toRequestBody(mediaType)
        val request = Request.Builder().url("http://10.0.2.2:5000/available_courses").post(body).build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@EnrollmentActivity, "Failed: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val responseData = response.body?.string()
                runOnUiThread {
                    if (response.isSuccessful && responseData != null) {
                        try {
                            val jsonObj = JSONObject(responseData)
                            val data: JSONArray = jsonObj.getJSONArray("data")
                            val schedList: MutableList<Course> = mutableListOf()

                            for (i in 0 until data.length()) {
                                val obj = data.getJSONObject(i)
                                val course = Course(
                                    obj.getInt("course_id"),
                                    obj.getString("course_name"),
                                    obj.getString("schedule_day"),
                                    obj.getString("schedule_time")
                                )
                                schedList.add(course)
                            }

                            val adapter = AvailableClassesAdapter(schedList) { course ->
                                viewModel.addCourse(course)
                            }
                            binding.recyclerViewUnenrolled.adapter = adapter
                        } catch (e: Exception) {
                            Toast.makeText(this@EnrollmentActivity, "Parsing error: ${e.message}", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        Toast.makeText(this@EnrollmentActivity, "Fetch Failed: $responseData", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    private fun enrollStudent(s_id: String) {
        val client = OkHttpClient()
        val courseIds = viewModel.addedCourses.value?.map { it.courseId } ?: return

        val json = JSONObject()
        json.put("student_id", s_id)
        json.put("course_ids", JSONArray(courseIds))

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val body: RequestBody = json.toString().toRequestBody(mediaType)
        val request = Request.Builder().url("http://10.0.2.2:5000/enroll_courses").post(body).build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@EnrollmentActivity, "Failed: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val responseData = response.body?.string()
                runOnUiThread {
                    if (response.isSuccessful) {
                        Toast.makeText(this@EnrollmentActivity, "Enrolled successfully!", Toast.LENGTH_SHORT).show()
                        viewModel.clearCourses()
                    } else {
                        Toast.makeText(this@EnrollmentActivity, "Enroll failed: $responseData", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }
}


data class Course(
    val courseId: Int,
    val courseName: String,
    val scheduleDay: String,
    val scheduleTime: String
)

class CoursesViewModel : ViewModel() {
    val addedCourses = MutableLiveData<List<Course>>(listOf())

    fun addCourse(course: Course) {
        val currentList = addedCourses.value ?: listOf()
        val newList = currentList.toMutableList()
        newList.add(course)
        addedCourses.value = newList
    }

    fun clearCourses() {
        addedCourses.value = mutableListOf()
    }

}


