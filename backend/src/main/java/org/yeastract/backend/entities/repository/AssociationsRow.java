package org.yeastract.backend.entities.repository;

import lombok.Data;

@Data
public class AssociationsRow {
    private long tfid;
    private String tf;
    private long orfid;
    private String orf;
    private String gene;
//    private String species;
//    private String protein;
}
