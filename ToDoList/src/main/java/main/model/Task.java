package main.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;
@Entity

public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public int id;
    public boolean isDone;
    public String title;
    public String description;
    public LocalDateTime creationTime;
    public LocalDateTime lastUpdateTime;
    public LocalDateTime performTime;

    public int getId() {
        return id;
    }
    public LocalDateTime getCreationTime() {
        return creationTime;
    }
    public boolean isDone() {
        return isDone;
    }
    public String getTitle() {
        return title;
    }
    public String getDescription() {
        return description;
    }
    public LocalDateTime getLastUpdateTime() {
        return lastUpdateTime;
    }
    public LocalDateTime getPerformTime() {
        return performTime;
    }

    public void setPerformTime(LocalDateTime performTime) {
        this.performTime = performTime;
    }
    public void setLastUpdateTime(LocalDateTime lastUpdateTime) {
        this.lastUpdateTime = lastUpdateTime;
    }
    public void setCreationTime(LocalDateTime creationTime) {
        this.creationTime = creationTime;
    }
    public void setDone(boolean done) {
        isDone = done;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public void setDescription(String description) {
        this.description = description;
    }
}
