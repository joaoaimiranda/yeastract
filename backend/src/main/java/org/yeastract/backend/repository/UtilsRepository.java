package org.yeastract.backend.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.yeastract.backend.entities.base.EnvCons;
import org.yeastract.backend.entities.base.Species;

import java.util.List;

@Repository
public class UtilsRepository {

    @Autowired
    private DBTemplate template;

    public Species getSpecies() {
        String q = "SELECT DISTINCT O.species FROM orfgene AS O";
        List<String> speciesList = template.getJdbcTemplateObject().query(q, new SpeciesMapper());
        return new Species(speciesList);
    }

    public EnvCons getEnvcons() {
        String q = "select distinct biggroup,subgroup from envconditiongroups";
        return new EnvCons();
    }
}
