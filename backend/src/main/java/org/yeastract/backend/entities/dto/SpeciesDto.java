package org.yeastract.backend.entities.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.yeastract.backend.entities.base.Species;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SpeciesDto {
    private List<String> species;

    public SpeciesDto(Species sp) {
        this.species = sp.getSpecies();
    }
}
