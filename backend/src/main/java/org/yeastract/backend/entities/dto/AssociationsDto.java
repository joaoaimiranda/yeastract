package org.yeastract.backend.entities.dto;

import java.util.List;
import java.util.Map;

import org.yeastract.backend.entities.base.Association;
import org.yeastract.backend.entities.base.Associations;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssociationsDto {
    private List<Association> links;

    public AssociationsDto(Associations assoc) {
        this.links = assoc.getLinks();
    }
}
