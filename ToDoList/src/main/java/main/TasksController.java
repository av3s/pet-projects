package main;

import main.model.TaskRepo;
import main.model.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Controller
public class TasksController {
    @Autowired
    private TaskRepo taskRepo;

    @RequestMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity getTask(@PathVariable @NonNull int id) {
        Optional<Task> optionalTask = taskRepo.findById(id);
        if (!optionalTask.isEmpty()) {
            return new ResponseEntity<Task>(optionalTask.get(), HttpStatus.OK);
        }
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("Get request failed (task number " + id + ": not found)");
    }

    @GetMapping("/tasks/")
    public ResponseEntity<ArrayList<Task>> getAllTasks() {
        ArrayList<Task> responseArray = new ArrayList<>();
        taskRepo.findAll().forEach(task -> responseArray.add(task));
        if (!responseArray.isEmpty()) {
            return new ResponseEntity(responseArray, HttpStatus.OK);
        }
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(responseArray);
    }

    @DeleteMapping(value = "/tasks/{id}")
    public ResponseEntity deleteTask(@PathVariable int id) {
        if (taskRepo.existsById(id)) {
            taskRepo.deleteById(id);
            return new ResponseEntity(true, HttpStatus.OK);
        }
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(false);
    }

    @DeleteMapping(value = "/tasks/clear")
    public ResponseEntity deleteAllTasks() {
        long taskCountBefore = taskRepo.count();
        if (taskCountBefore == 0) {
            return ResponseEntity
                    .status(HttpStatus.I_AM_A_TEAPOT)
                    .body("Task database is empty");
        }
        taskRepo.deleteAll();
        long taskCountAfter = taskRepo.count();
        if (taskCountAfter == 0) {
            return ResponseEntity.ok("deleted " + taskCountBefore + " tasks");
        } else {
            return ResponseEntity
                    .status(HttpStatus.I_AM_A_TEAPOT)
                    .body("deleted " + (long) (taskCountBefore - taskCountAfter) + " of " + taskCountBefore + "tasks");
        }
    }

    @PostMapping(value = "/tasks/")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity addTask(@RequestHeader Map<String, String> headers, @NonNull @RequestBody Task tr) {
        tr.setCreationTime(LocalDateTime.now().withNano(0));
        tr.setLastUpdateTime(tr.getCreationTime());
        Task newTask = taskRepo.save(tr);
        return ResponseEntity.status(HttpStatus.CREATED).body(newTask.getId());
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity updateTask(@PathVariable int id,@NonNull @RequestBody Task trb){
        boolean isDoneModified = false;
        boolean isIdFound = taskRepo.existsById(id);
        System.out.println(id + " " + ("PUT " + trb.id + " " + trb.getTitle() + " " + isIdFound));
        taskToString(trb);
        Task task = taskRepo.findById(id).get();
        taskToString(task);
        taskToString(trb);
        if(isIdFound){
            if(Objects.nonNull(trb.title) && !task.title.equals(trb.title)){
                task.setTitle(trb.title);
            }
            if(Objects.nonNull(trb.description) && !task.description.equals(trb.description)){
                task.setDescription(trb.description);
            }
            if ((Objects.nonNull(trb.performTime)) && !task.performTime.equals(trb.performTime)){
                task.setPerformTime(trb.performTime.withNano(999999));
            }
            if((Objects.nonNull(trb.isDone)) && task.isDone != trb.isDone){
                isDoneModified = true;
                task.setDone(trb.isDone);
            }
            task.setLastUpdateTime(LocalDateTime.now().withNano(0));
            taskRepo.save(task);
            taskToString(task);
            return ResponseEntity.status(HttpStatus.OK).body(isDoneModified ? task.isDone : null);
        }else{
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("PUT request failed (task number " + id + ": not found)");
        }
    }

    private String taskToString(Task task) {
        StringBuilder sb = new StringBuilder();
        sb.append("ID: ")
            .append(Objects.nonNull(task.getId()) ? task.getId() : "?")
                .append("\t")
                .append("isDone: ")
                .append(Objects.nonNull(task.isDone()) ? task.isDone() : "?")
                .append("\n\t")
                .append("title: ")
                .append(Objects.nonNull(task.getTitle()) ? task.getTitle() : "?").append("\n\t")
                .append("desc: ")
                .append(Objects.nonNull(task.getDescription()) ? task.getDescription() : "?").append("\n\t")
                .append("create: ");
        return sb.toString();
    }
}
