package org.yeastract.backend.entities.base;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class Species {
    private List<String> species;
}
