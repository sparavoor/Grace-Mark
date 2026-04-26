/**
 * Scoring Logic for Grace Marks
 * Total Max Marks: 20
 * Breakdown:
 * - Sector Level: 10 Marks (Proportional to 10 required meetings)
 * - Unit Level: 10 Marks (Proportional to 5 meetings per unit across all units)
 */

export function calculateGraceMarks(sector) {
  if (!sector) return { total: 0, sectorMarks: 0, unitMarks: 0 };

  const REQUIRED_SECTOR_MEETINGS = 8;
  const REQUIRED_UNIT_MEETINGS = 5;
  const MARKS_PER_CATEGORY = 10;
  
  // 1. Sector Level Scoring (Target: 10 Marks)
  // Based on 8 required meetings
  const sectorReports = sector.reports.filter(r => r.meeting.targetGroup === 'SECTOR');
  const uniqueSectorMeetings = new Set(sectorReports.map(r => r.meetingId)).size;
  const sectorProgress = Math.min(uniqueSectorMeetings / REQUIRED_SECTOR_MEETINGS, 1);
  const sectorMarks = sectorProgress * MARKS_PER_CATEGORY;

  // 2. Unit Level Scoring (Target: 10 Marks)
  // Dynamic calculation: (Total reports across all units) / (Total units * 5 meetings)
  const units = sector.units || [];
  let unitMarks = 0;
  let unitProgress = 0;
  
  if (units.length > 0) {
    let totalCompletedUnitMeetings = 0;
    const totalRequiredUnitMeetings = units.length * REQUIRED_UNIT_MEETINGS;
    
    units.forEach(unit => {
      const unitReports = sector.reports.filter(r => 
        r.meeting.targetGroup === 'UNIT' && r.unitId === unit.id
      );
      // Count unique meetings per unit, capped at 5
      const uniqueUnitMeetings = new Set(unitReports.map(r => r.meetingId)).size;
      totalCompletedUnitMeetings += Math.min(uniqueUnitMeetings, REQUIRED_UNIT_MEETINGS);
    });
    
    unitProgress = totalCompletedUnitMeetings / totalRequiredUnitMeetings;
    unitMarks = unitProgress * MARKS_PER_CATEGORY;
  }

  const total = sectorMarks + unitMarks;

  return {
    total: parseFloat(total.toFixed(2)),
    sectorMarks: parseFloat(sectorMarks.toFixed(2)),
    unitMarks: parseFloat(unitMarks.toFixed(2)),
    sectorPercentage: Math.round(sectorProgress * 100),
    unitPercentage: Math.round(unitProgress * 100)
  };
}
