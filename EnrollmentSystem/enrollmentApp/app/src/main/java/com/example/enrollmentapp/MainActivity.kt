package com.example.enrollmentapp

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.enrollmentapp.databinding.ActivityMainBinding
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

//api service connection
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException


class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val studentId = intent.getStringExtra("student_id") ?: "1"
        val studentName = intent.getStringExtra("student_name")

        Toast.makeText(this, "Welcome $studentName!", Toast.LENGTH_LONG).show()

        // Set RecyclerView LayoutManager
        binding.recyclerViewCourses.layoutManager = LinearLayoutManager(this@MainActivity)
        binding.recyclerViewSchedule.layoutManager = LinearLayoutManager(this@MainActivity)


        if (studentId.isNotEmpty()) {
            loadCoursesTable(studentId)
            loadScheduleTable(studentId)
        } else {
            Toast.makeText(this, "Invalid student ID", Toast.LENGTH_SHORT).show()
        }

        binding.button.setOnClickListener {
            val intent = Intent(this@MainActivity, EnrollmentActivity::class.java)
            startActivity(intent)
        }
        // swipe up to refresh
        binding.swipeRefreshLayout.setOnRefreshListener {
            loadCoursesTable(studentId)
            loadScheduleTable(studentId)// Reload your data
            binding.swipeRefreshLayout.isRefreshing = false  // Stop the spinner
        }
        binding.swipeSchedLayout.setOnRefreshListener {
            loadCoursesTable(studentId)
            loadScheduleTable(studentId)// Reload your data
            binding.swipeSchedLayout.isRefreshing = false  // Stop the spinner
        }
    }

    fun loadCoursesTable(s_id: String) {
        val client = OkHttpClient()

        val json = JSONObject()
        json.put("student_id", s_id)
        Toast.makeText(this@MainActivity, "Student ID: $s_id", Toast.LENGTH_LONG).show()

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val body: RequestBody = json.toString().toRequestBody(mediaType)

        val request = Request.Builder()
            .url("http://10.0.2.2:5000/course_list")
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@MainActivity, "Failed: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val responseData = response.body?.string()
                runOnUiThread {
                    if (response.isSuccessful && responseData != null) {
                        try {
                            val jsonObj = JSONObject(responseData)
                            val data: JSONArray = jsonObj.getJSONArray("data")


                            val enrollmentList: MutableList<Enrollment> = ArrayList()
                            val header = Enrollment(
                                "Courses","Enrollment Date"
                            )
                            enrollmentList.add(header)
                            for (i in 0 until data.length()) {
                                val obj = data.getJSONObject(i)
                                val e = Enrollment(
                                    obj.getString("course_name"),
                                    obj.getString("enrollment_date")
                                )
                                enrollmentList.add(e)
                            }

                            // Update RecyclerView
                            if (enrollmentList.isNotEmpty()) {
                                val adapter = EnrollmentAdapter(enrollmentList)
                                binding.recyclerViewCourses.adapter = adapter
                            } else {
                                Toast.makeText(this@MainActivity, "No enrollments found", Toast.LENGTH_SHORT).show()
                            }

                        } catch (e: Exception) {
                            Toast.makeText(this@MainActivity, "Parsing error: ${e.message}", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        Toast.makeText(this@MainActivity, "Fetch Failed: $responseData", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    fun loadScheduleTable(s_id: String){
        val client = OkHttpClient()

        val json = JSONObject()
        json.put("student_id", s_id)
        val mediaType = "application/json; charset=utf-8".toMediaType()
        val body: RequestBody = json.toString().toRequestBody(mediaType)

        val request = Request.Builder().url("http://10.0.2.2:5000/sched_list").post(body).build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@MainActivity, "Failed: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val responseData = response.body?.string()
                runOnUiThread {
                    if (response.isSuccessful && responseData != null) {
                        try {
                            val jsonObj = JSONObject(responseData)
                            val data: JSONArray = jsonObj.getJSONArray("data")

                            val schedList: MutableList<ScheduleItem> = ArrayList()

                            for (i in 0 until data.length()) {
                                val obj = data.getJSONObject(i)

                                val o = ScheduleItem(
                                    obj.getString("course_name"),
                                    obj.getString("schedule_day"),
                                    obj.getString("schedule_time")
                                )
                                schedList.add(o)
                            }

                            // Update RecyclerView
                            if (schedList.isNotEmpty()) {
                                val adapter = ScheduleAdapter(schedList)
                                binding.recyclerViewSchedule.adapter = adapter
                            } else {
                                Toast.makeText(this@MainActivity, "No schedules found", Toast.LENGTH_SHORT).show()
                            }

                        } catch (e: Exception) {
                            Toast.makeText(this@MainActivity, "Parsing error: ${e.message}", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        Toast.makeText(this@MainActivity, "Fetch Failed: $responseData", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }
}
