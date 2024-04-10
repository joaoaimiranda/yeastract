package org.yeastract.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.yeastract.backend.entities.base.Species;
import org.yeastract.backend.repository.UtilsRepository;

@Service
public class UtilsService {

    @Autowired
    private UtilsRepository repository;

    public Species getSpecies() {
        return repository.getSpecies();
    }
}
