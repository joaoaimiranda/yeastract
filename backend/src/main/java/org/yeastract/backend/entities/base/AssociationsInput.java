package org.yeastract.backend.entities.base;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssociationsInput {
    private String tfs;
    private String genes;
    private String evidence;
    private String documented;
    private boolean activator;
    private boolean inhibitor;
    private boolean noexprinfo;
    private String envconGroup;
    private String envconSubgroup;
    private String synteny;
    private String homolog;
}
