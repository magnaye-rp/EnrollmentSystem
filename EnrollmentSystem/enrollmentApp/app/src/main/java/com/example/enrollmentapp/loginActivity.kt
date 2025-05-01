package com.example.enrollmentapp
//ui application
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.enrollmentapp.databinding.ActivityLoginBinding

//api service connection
import okhttp3.*
import org.json.JSONObject
import java.io.IOException
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import android.content.Intent

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Setup View Binding
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Button click listener
        binding.buttonLogin.setOnClickListener {
            val username = binding.editTextUsername.text.toString()
            val password = binding.editTextPassword.text.toString()
            callLoginApi(username, password)
        }
    }
    fun callLoginApi(email: String, password: String) {
        val client = OkHttpClient()

        val json = JSONObject()
        json.put("email", email)
        json.put("password", password)

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val body: RequestBody = json.toString().toRequestBody(mediaType)

        val request = Request.Builder()
            .url("http:///10.0.2.2:5000/login")
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    ("Failed: ${e.message}")
                    Toast.makeText(this@LoginActivity, "Failed: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val responseData = response.body?.string()
                runOnUiThread {
                    if (response.isSuccessful && responseData != null) {
                        val jsonObject = JSONObject(responseData)
                        val studentId = jsonObject.getInt("user_id")
                        val studentName = jsonObject.getString("user_name")

                        Toast.makeText(this@LoginActivity, "Login Success! Student ID: $studentId", Toast.LENGTH_SHORT).show()

                        val intent = Intent(this@LoginActivity, MainActivity::class.java)
                        intent.putExtra("student_id", studentId)
                        intent.putExtra("student_name", studentName)
                        startActivity(intent)
                        finish()

                    } else {
                        Toast.makeText(this@LoginActivity, "Login Failed: $responseData", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

}
