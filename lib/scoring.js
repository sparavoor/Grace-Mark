/**
 * Scoring Logic for Grace Marks
 * Total Max Marks: 20
 * Breakdown:
 * - Sector Level: 10 Marks (Proportional to 10 required meetings)
 * - Unit Level: 10 Marks (Proportional to 5 meetings per unit across all units)
 */

export function calculateGraceMarksCategory(submissions, units = []) {
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

  if (submissions && Array.isArray(submissions)) {
    // 1. Separate unit-level submissions and sector-level submissions
    const unitSahityotsavSubs = submissions.filter(sub => sub.isTicked && sub.criteria && sub.criteria.isActive && sub.criteria.type === 'UNIT_SAHITYOTSAV');
    const brightUnitSahityotsavSubs = submissions.filter(sub => sub.isTicked && sub.criteria && sub.criteria.isActive && sub.criteria.type === 'BRIGHT_UNIT_SAHITYOTSAV');
    const shineSectorSub = submissions.find(sub => sub.isTicked && sub.criteria && sub.criteria.isActive && sub.criteria.type === 'SHINE_SECTOR');

    // Calculate UNIT_SAHITYOTSAV
    if (unitSahityotsavSubs.length > 0) {
      unitSahityotsavTicked = true;
      let totalUnitSahityotsavMarks = 0;
      let totalUnitSahityotsavPercent = 0;
      unitSahityotsavSubs.forEach(sub => {
        const pct = sub.percentage || 0;
        totalUnitSahityotsavPercent += pct;
        if (pct >= 100) totalUnitSahityotsavMarks += 15;
        else if (pct >= 90) totalUnitSahityotsavMarks += 12;
        else if (pct >= 80) totalUnitSahityotsavMarks += 8;
        else if (pct >= 70) totalUnitSahityotsavMarks += 5;
      });
      // Sector mark is the average over all units in the sector
      unitSahityotsavMarks = totalUnitSahityotsavMarks / numUnits;
      unitSahityotsavPercent = totalUnitSahityotsavPercent / numUnits;
    }

    // Calculate BRIGHT_UNIT_SAHITYOTSAV
    if (brightUnitSahityotsavSubs.length > 0) {
      brightUnitSahityotsavTicked = true;
      let totalBrightUnitSahityotsavMarks = 0;
      let totalBrightUnitSahityotsavPercent = 0;
      brightUnitSahityotsavSubs.forEach(sub => {
        const pct = sub.percentage || 0;
        totalBrightUnitSahityotsavPercent += pct;
        if (pct >= 100) totalBrightUnitSahityotsavMarks += 25;
        else if (pct >= 80) totalBrightUnitSahityotsavMarks += 20;
        else if (pct >= 60) totalBrightUnitSahityotsavMarks += 15;
        else if (pct >= 40) totalBrightUnitSahityotsavMarks += 10;
        else if (pct >= 20) totalBrightUnitSahityotsavMarks += 5;
      });
      brightUnitSahityotsavMarks = totalBrightUnitSahityotsavMarks / numUnits;
      brightUnitSahityotsavPercent = totalBrightUnitSahityotsavPercent / numUnits;
    }

    // Calculate SHINE_SECTOR
    if (shineSectorSub) {
      shineSectorTicked = true;
      const pct = shineSectorSub.percentage || 0;
      shineSectorPercent = pct;
      shineSectorMarks = (pct / 100) * 20;
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

export function calculateGraceMarks(sector) {
  if (!sector) return { total: 0, sectorMarks: 0, unitMarks: 0, graceMarksTotal: 0, graceMarks: calculateGraceMarksCategory([], []) };

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
  const grace = calculateGraceMarksCategory(sector.graceMarkSubmissions || [], sector.units || []);

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
