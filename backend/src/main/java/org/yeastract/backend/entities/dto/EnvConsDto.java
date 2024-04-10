package org.yeastract.backend.entities.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.yeastract.backend.entities.base.EnvCons;

import java.util.HashMap;
import java.util.List;

@Data
public class EnvConsDto {
    private HashMap<String, List<String>> envcons;

    public EnvConsDto(EnvCons e) {
        this.envcons = e.getEnvcons();
    }
}
