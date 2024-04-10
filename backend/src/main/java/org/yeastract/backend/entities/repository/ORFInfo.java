package org.yeastract.backend.entities.repository;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.HashMap;
import java.util.LinkedList;

@Data
@AllArgsConstructor
public class ORFInfo {
    private LinkedList<Long> ids;
    private HashMap<Long, String> orfIndex;
}