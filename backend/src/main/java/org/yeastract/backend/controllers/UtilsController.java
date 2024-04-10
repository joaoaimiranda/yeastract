package org.yeastract.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.yeastract.backend.entities.base.Species;
import org.yeastract.backend.entities.dto.SpeciesDto;
import org.yeastract.backend.services.UtilsService;

@RestController
@RequestMapping(path = "/utils")
public class UtilsController {

    @Autowired
    private UtilsService service;

    @GetMapping(path = "/species", produces = MediaType.APPLICATION_JSON_VALUE)
    private SpeciesDto getSpecies() {
        Species species = service.getSpecies();
        return new SpeciesDto(species);
    }
}
