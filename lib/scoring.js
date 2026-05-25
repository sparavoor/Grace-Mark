/**
 * Scoring Logic for Grace Marks
 * Total Max Marks: 20
 * Breakdown:
 * - Sector Level: 10 Marks (Proportional to 10 required meetings)
 * - Unit Level: 10 Marks (Proportional to 5 meetings per unit across all units)
 */

export function calculateGraceMarksCategory(submissions, units = [], activeShineCriteriaCount = 1) {
  let unitSahityotsavMarks = 0;
  let brightUnitSahityotsavMarks = 0;
  let shineSectorMarks = 0;

  let unitSahityotsavPercent = 0;
  let brightUnitSahityotsavPercent = 0;
  let shineSectorPercent = 0;

  let unitSahityotsavTicked = false;
  let brightUnitSahityotsavTicked = false;
  let shineSectorTicked = false;

  const numUnits = units.length || 1;
  const count = activeShineCriteriaCount > 0 ? activeShineCriteriaCount : 1;
  const marksPerCriteria = 20 / count;

  if (submissions && Array.isArray(submissions)) {
    // 1. Separate unit-level submissions and sector-level submissions
    const unitSahityotsavSubs = submissions.filter(sub => sub.isTicked && sub.criteria && sub.criteria.isActive && sub.criteria.type === 'UNIT_SAHITYOTSAV');
    const brightUnitSahityotsavSubs = submissions.filter(sub => sub.isTicked && sub.criteria && sub.criteria.isActive && sub.criteria.type === 'BRIGHT_UNIT_SAHITYOTSAV');
    const shineSectorSubs = submissions.filter(sub => sub.isTicked && sub.criteria && sub.criteria.isActive && sub.criteria.type === 'SHINE_SECTOR');

    // Calculate UNIT_SAHITYOTSAV
    if (unitSahityotsavSubs.length > 0) {
      unitSahityotsavTicked = true;
      // Percentage is (ticked units / total units) * 100
      unitSahityotsavPercent = Math.round((unitSahityotsavSubs.length / numUnits) * 100);
      
      if (unitSahityotsavPercent >= 100) unitSahityotsavMarks = 15;
      else if (unitSahityotsavPercent >= 90) unitSahityotsavMarks = 12;
      else if (unitSahityotsavPercent >= 80) unitSahityotsavMarks = 8;
      else if (unitSahityotsavPercent >= 70) unitSahityotsavMarks = 5;
      else unitSahityotsavMarks = 0;
    }

    // Calculate BRIGHT_UNIT_SAHITYOTSAV
    if (brightUnitSahityotsavSubs.length > 0) {
      brightUnitSahityotsavTicked = true;
      // Percentage is (ticked units / total units) * 100
      brightUnitSahityotsavPercent = Math.round((brightUnitSahityotsavSubs.length / numUnits) * 100);
      
      if (brightUnitSahityotsavPercent >= 100) brightUnitSahityotsavMarks = 25;
      else if (brightUnitSahityotsavPercent >= 80) brightUnitSahityotsavMarks = 20;
      else if (brightUnitSahityotsavPercent >= 60) brightUnitSahityotsavMarks = 15;
      else if (brightUnitSahityotsavPercent >= 40) brightUnitSahityotsavMarks = 10;
      else if (brightUnitSahityotsavPercent >= 20) brightUnitSahityotsavMarks = 5;
      else brightUnitSahityotsavMarks = 0;
    }

    // Calculate SHINE_SECTOR
    if (shineSectorSubs.length > 0) {
      shineSectorTicked = true;
      let totalEarned = 0;
      let totalPct = 0;

      shineSectorSubs.forEach(sub => {
        const pct = sub.percentage || 0;
        totalPct += pct;
        const st = sub.criteria.shineType || 'TICK';

        let earned = 0;
        if (st === 'TICK' || st === 'TEXT') {
          earned = marksPerCriteria;
        } else if (st === 'NUMBER') {
          const target = sub.criteria.targetSteps;
          if (target && target > 0) {
            earned = pct >= target ? marksPerCriteria : 0;
          } else {
            earned = (pct / 100) * marksPerCriteria;
          }
        } else {
          earned = (pct / 100) * marksPerCriteria;
        }
        totalEarned += earned;
      });

      // Clamp max marks to 20 just in case
      shineSectorMarks = Math.min(totalEarned, 20);
      // Avg percentage of all completed submissions
      shineSectorPercent = Math.round(totalPct / shineSectorSubs.length);
    }
  }

  const totalGraceMarks = unitSahityotsavMarks + brightUnitSahityotsavMarks + shineSectorMarks;

  return {
    total: parseFloat(totalGraceMarks.toFixed(2)),
    unitSahityotsav: {
      marks: parseFloat(unitSahityotsavMarks.toFixed(2)),
      percentage: Math.round(unitSahityotsavPercent),
      isTicked: unitSahityotsavTicked,
      maxMarks: 15
    },
    brightUnitSahityotsav: {
      marks: parseFloat(brightUnitSahityotsavMarks.toFixed(2)),
      percentage: Math.round(brightUnitSahityotsavPercent),
      isTicked: brightUnitSahityotsavTicked,
      maxMarks: 25
    },
    shineSector: {
      marks: parseFloat(shineSectorMarks.toFixed(2)),
      percentage: shineSectorPercent,
      isTicked: shineSectorTicked,
      maxMarks: 20
    }
  };
}

export function calculateGraceMarks(sector, activeShineCriteriaCount = 1) {
  if (!sector) return { total: 0, sectorMarks: 0, unitMarks: 0, graceMarksTotal: 0, graceMarks: calculateGraceMarksCategory([], [], 1) };

  const REQUIRED_SECTOR_MEETINGS = 8;
  const REQUIRED_UNIT_MEETINGS = 5;
  const MARKS_PER_CATEGORY = 10;
  
  // 1. Sector Level Scoring (Target: 10 Marks)
  // Based on 8 required meetings
  const sectorReports = sector.reports ? sector.reports.filter(r => r.meeting.targetGroup === 'SECTOR') : [];
  const uniqueSectorMeetings = new Set(sectorReports.map(r => r.meetingId)).size;
  const sectorProgress = Math.min(uniqueSectorMeetings / REQUIRED_SECTOR_MEETINGS, 1);
  const sectorMarks = sectorProgress * MARKS_PER_CATEGORY;

  // 2. Unit Level Scoring (Target: 10 Marks)
  const units = sector.units || [];
  let unitMarks = 0;
  let unitProgress = 0;
  
  if (units.length > 0) {
    let totalCompletedUnitMeetings = 0;
    const totalRequiredUnitMeetings = units.length * REQUIRED_UNIT_MEETINGS;
    
    units.forEach(unit => {
      const unitReports = sector.reports ? sector.reports.filter(r => 
        r.meeting.targetGroup === 'UNIT' && r.unitId === unit.id
      ) : [];
      const uniqueUnitMeetings = new Set(unitReports.map(r => r.meetingId)).size;
      totalCompletedUnitMeetings += Math.min(uniqueUnitMeetings, REQUIRED_UNIT_MEETINGS);
    });
    
    unitProgress = totalCompletedUnitMeetings / totalRequiredUnitMeetings;
    unitMarks = unitProgress * MARKS_PER_CATEGORY;
  }

  // 3. Grace Marks Scoring
  const grace = calculateGraceMarksCategory(sector.graceMarkSubmissions || [], sector.units || [], activeShineCriteriaCount);

  const total = sectorMarks + unitMarks + grace.total;

  return {
    total: parseFloat(total.toFixed(2)),
    sectorMarks: parseFloat(sectorMarks.toFixed(2)),
    unitMarks: parseFloat(unitMarks.toFixed(2)),
    sectorPercentage: Math.round(sectorProgress * 100),
    unitPercentage: Math.round(unitProgress * 100),
    graceMarksTotal: grace.total,
    graceMarks: grace
  };
}
