package org.yeastract.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.yeastract.backend.entities.base.Associations;
import org.yeastract.backend.entities.base.AssociationsInput;
import org.yeastract.backend.repository.AssociationsRepository;

@Service
public class AssociationsService {
    
    @Autowired
    private AssociationsRepository repository;

    public Associations getAssociations(AssociationsInput input) {
        if (input.getTfs().isBlank() && input.getGenes().isBlank()) {
            return repository.getAllAssociations(input);
        }
        else if (input.getGenes().isBlank()) {
            return repository.getAssociationsByTF(input);
        }
        else if (input.getTfs().isBlank()) {
            return repository.getAssociationsByGene(input);
        }
        else
            return repository.getAssociations(input);
    }

}
