package org.yeastract.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.yeastract.backend.entities.base.Associations;
import org.yeastract.backend.entities.dto.AssociationsDto;
import org.yeastract.backend.entities.base.AssociationsInput;
import org.yeastract.backend.services.AssociationsService;

@RestController
@RequestMapping(path = "/associations")
public class AssociationsController {
    
    @Autowired
    private AssociationsService service;

    @PostMapping(path = "/search", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    private AssociationsDto getAssociations(@RequestBody AssociationsInput input) {
        Associations assoc = service.getAssociations(input);
        return new AssociationsDto(assoc);
    }
}
