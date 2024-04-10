package org.yeastract.backend.entities.base;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.yeastract.backend.entities.repository.AssociationsRow;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Associations {
    private List<Association> links;
}
