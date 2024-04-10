package org.yeastract.backend.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.yeastract.backend.entities.base.Association;
import org.yeastract.backend.entities.base.Associations;
import org.yeastract.backend.entities.base.AssociationsInput;
import org.yeastract.backend.entities.repository.AssociationsRow;
import org.yeastract.backend.entities.repository.ORFInfo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class AssociationsRepository {

    @Autowired
    private DBTemplate template;

//    @Override
//    public AssociationsRow mapRow(ResultSet rs, int rowNum) {
//        try {
//            AssociationsRow row = new AssociationsRow();
//            row.setOrfid(rs.getLong("orfid"));
//            row.setOrf(rs.getString("orf"));
//            row.setGene(rs.getString("gene"));
//            row.setSpecies(rs.getString("species"));
//            row.setProtein(rs.getString("protein"));
//            return row;
//        } catch (SQLException e) {
//            System.err.println("ERROR IN QUERY: " + e.getMessage());
//            e.printStackTrace();
//            return null;
//        }
//    }



    private List<Long> getIdsFromNames(String names) {
        String[] nameList = names.split("[ \t\n\r\0,;|]+");

        LinkedList<Long> ids = new LinkedList<>();

        for (String name : nameList) {
            String q1 = String.format("select O.orfid from orfgene as O " +
                    "LEFT OUTER JOIN protein as P ON P.tfid=O.orfid WHERE (O.orf='%s' or O.gene='%s')" +
                    " and O.species in ('Saccharomyces cerevisiae S288c')", name, name);

            String q2 = String.format("select O.orfid from " +
                    "orfgene as O, alias as A, protein as P where A.orfid=O.orfid and P.tfid=O.orfid " +
                    "and A.alias='%s' and O.species in ('Saccharomyces cerevisiae S288c')", name);

            String q3 = String.format("select O.orfid from orfgene as O, protein as P where " +
                    "P.tfid=O.orfid and P.protein='%s' and O.species in ('Saccharomyces cerevisiae S288c')", name);

            List<Long> orf;

            ORFMapper orfMapper = new ORFMapper();
            orf = template.getJdbcTemplateObject().query(q1, orfMapper);
            if (orf.isEmpty()) {
                orf = template.getJdbcTemplateObject().query(q2, orfMapper);
                if (orf.isEmpty()) {
                    orf = template.getJdbcTemplateObject().query(q3, orfMapper);
                }
            }
            if (!orf.isEmpty()) {
                ids.addAll(orf);
            }
        }

        return ids;
    }

    public Associations getAssociationsByTF(AssociationsInput input) {
        List<Long> ids = this.getIdsFromNames(input.getTfs());
//        HashMap<Long, String> orfIndex = info.getOrfIndex();

        String idsString = ids.stream().map(String::valueOf).collect(Collectors.joining(", "));

        String q = "select distinct R.tfid, R.targetid, O.gene, O.orf, P.protein from regulation as R left outer join orfgene as O" +
                " on R.targetid=O.orfid left outer join protein as P ON R.tfid=P.tfid" +
                " where R.tfid in (" + idsString + ") and R.regulationid in " +
                "(select distinct regulationid from regulationdata where evidencecodeid in " +
                "(select evidencecodeid from evidencecodeBSRG where code='Indirect' and " +
                "(association like 'Positive%' or association like '%Negative' or association like 'N/A')));";

//        String query = String.format("select O.orfid,O.orf,O.gene,O.species,P.protein from orfgene as O, protein as P" +
//                " where P.tfid=O.orfid and O.orfid in (%s);", q);

        List<AssociationsRow> associationsList = template.getJdbcTemplateObject().query(q, new AssociationsMapper());
        List<Association> res = new ArrayList<>();
        for (AssociationsRow row : associationsList) {
            res.add(new Association(row.getTf(), row.getGene()));
        }
//        List<Association> res = associationsList.stream().map(row -> new Association(orfIndex.get(row.getTfid()), row.getGene())).toList();
        return new Associations(res);
    }

    public Associations getAssociationsByGene(AssociationsInput input) {
//        ORFInfo info = this.getIdsFromNames(input.getGenes());
        List<Long> ids = this.getIdsFromNames(input.getGenes());
//        HashMap<Long, String> orfIndex = info.getOrfIndex();

        String idsString = ids.stream().map(String::valueOf).collect(Collectors.joining(", "));

        String q = "select distinct R.tfid, R.targetid, P.protein, O.orf, O.gene from regulation as R " +
                "left outer join protein as P on R.tfid=P.tfid left outer join orfgene as O on R.targetid=O.orfid " +
                "where R.targetid in (" + idsString + ") and R.regulationid in " +
                "(select distinct regulationid from regulationdata where evidencecodeid in " +
                "(select evidencecodeid from evidencecodeBSRG where code='Indirect' and " +
                "(association like 'Positive%' or association like '%Negative' or association like 'N/A')));";

        List<AssociationsRow> associationsList = template.getJdbcTemplateObject().query(q, new AssociationsMapper());
        List<Association> res = new ArrayList<>();
        for (AssociationsRow row : associationsList) {
            String gene = row.getGene().equals(row.getOrf()) ? row.getOrf() : String.join("/", row.getOrf(), row.getGene());
            res.add(new Association(row.getTf(), gene));
        }
        return new Associations(res);
    }

    public Associations getAssociations(AssociationsInput input) {
        List<Long> tfIds = this.getIdsFromNames(input.getTfs());
        List<Long> geneIds = this.getIdsFromNames(input.getGenes());

        String tfIdsString = tfIds.stream().map(String::valueOf).collect(Collectors.joining(", "));
        String geneIdsString = geneIds.stream().map(String::valueOf).collect(Collectors.joining(", "));

        String q = "select distinct R.tfid, R.targetid, O.gene, O.orf, P.protein from regulation as R left outer join orfgene as O" +
                " on R.targetid=O.orfid left outer join protein as P ON R.tfid=P.tfid" +
                " where R.targetid in (" + geneIdsString + ") and R.tfid in (" + tfIdsString + ") and R.regulationid in " +
                "(select distinct regulationid from regulationdata where evidencecodeid in " +
                "(select evidencecodeid from evidencecodeBSRG where code='Indirect' and " +
                "(association like 'Positive%' or association like '%Negative' or association like 'N/A')));";

        List<AssociationsRow> associationsList = template.getJdbcTemplateObject().query(q, new AssociationsMapper());
        List<Association> res = new ArrayList<>();
        for (AssociationsRow row : associationsList) {
            res.add(new Association(row.getTf(), row.getGene()));
        }
        return new Associations(res);
    }

    public Associations getAllAssociations(AssociationsInput input) {
        return new Associations();
    }
}
