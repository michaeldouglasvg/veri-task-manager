package com.example.taskmanager.controller;

import com.example.taskmanager.dto.TaskRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.TaskStatus;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    @Autowired
    TaskRepository taskRepository;

    // get the currently authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return new User();
    }

    @PostMapping
    public ResponseEntity<?> createTask(@Valid @RequestBody TaskRequest taskRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            User user = new User();
            user.setId(userDetails.getId());
            user.setUsername(userDetails.getUsername());
            
            Task task = new Task(taskRequest.getTitle(), taskRequest.getDescription(), user);
            
            if (taskRequest.getStatus() != null) {
                task.setStatus(TaskStatus.valueOf(taskRequest.getStatus()));
            }
            
            Task savedTask = taskRepository.save(task);
            TaskResponse response = new TaskResponse(
                savedTask.getId(),
                savedTask.getTitle(),
                savedTask.getDescription(),
                savedTask.getStatus().name()
            );
            
            logger.info("Task created successfully by user: {}", userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating task: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error creating task");
        }
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            User user = new User();
            user.setId(userDetails.getId());
        
            List<Task> tasks = taskRepository.findByUser(user);
            List<TaskResponse> taskResponses = tasks.stream()
                .map(task -> new TaskResponse(
                    task.getId(),
                    task.getTitle(),
                    task.getDescription(),
                    task.getStatus().name()
                ))
                .collect(Collectors.toList());
            
            logger.info("Retrieved {} tasks for user: {}", taskResponses.size(), userDetails.getUsername());
            return ResponseEntity.ok(taskResponses);
        } catch (Exception e) {
            logger.error("Error retrieving tasks: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            User user = new User();
            user.setId(userDetails.getId());
            
            // Check if task exists and belongs to the current user
            if (!taskRepository.existsByIdAndUser(id, user)) {
                logger.warn("Task {} not found or doesn't belong to user: {}", id, userDetails.getUsername());
                return ResponseEntity.notFound().build();
            }
            
            Task task = taskRepository.findById(id).orElse(null);
            if (task == null) {
                return ResponseEntity.notFound().build();
            }
            
            TaskResponse response = new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus().name()
            );
            
            logger.info("Retrieved task {} for user: {}", id, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving task {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body("Error retrieving task");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest taskRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            User user = new User();
            user.setId(userDetails.getId());
            
            // Check if task exists and belongs to the current user
            if (!taskRepository.existsByIdAndUser(id, user)) {
                logger.warn("Task {} not found or doesn't belong to user: {}", id, userDetails.getUsername());
                return ResponseEntity.notFound().build();
            }
            
            Task task = taskRepository.findById(id).orElse(null);
            if (task == null) {
                return ResponseEntity.notFound().build();
            }
            
            task.setTitle(taskRequest.getTitle());
            task.setDescription(taskRequest.getDescription());
            
            if (taskRequest.getStatus() != null) {
                task.setStatus(TaskStatus.valueOf(taskRequest.getStatus()));
            }
            
            Task updatedTask = taskRepository.save(task);
            
            TaskResponse response = new TaskResponse(
                updatedTask.getId(),
                updatedTask.getTitle(),
                updatedTask.getDescription(),
                updatedTask.getStatus().name()
            );
            
            logger.info("Task {} updated successfully by user: {}", id, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating task {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body("Error updating task");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            User user = new User();
            user.setId(userDetails.getId());
            
            // Check if task exists and belongs to the current user
            if (!taskRepository.existsByIdAndUser(id, user)) {
                logger.warn("Task {} not found or doesn't belong to user: {}", id, userDetails.getUsername());
                return ResponseEntity.notFound().build();
            }
            
            taskRepository.deleteById(id);
            
            logger.info("Task {} deleted successfully by user: {}", id, userDetails.getUsername());
            return ResponseEntity.ok("Task deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting task {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body("Error deleting task");
        }
    }
}