/**
 * Scoring Logic for Grace Marks
 * Total Max Marks: 20
 * Breakdown:
 * - Sector Level: 10 Marks (Proportional to 10 required meetings)
 * - Unit Level: 10 Marks (Proportional to 5 meetings per unit across all units)
 */

export function calculateGraceMarks(sector) {
  if (!sector) return { total: 0, sectorMarks: 0, unitMarks: 0 };

  const REQUIRED_SECTOR_MEETINGS = 10;
  const REQUIRED_UNIT_MEETINGS = 5;
  const MAX_CATEGORY_MARKS = 20;
  
  // Sector Level Meetings
  const sectorReports = sector.reports.filter(r => r.meeting.targetGroup === 'SECTOR');
  const uniqueSectorMeetings = new Set(sectorReports.map(r => r.meetingId)).size;
  const sectorProgress = Math.min(uniqueSectorMeetings / REQUIRED_SECTOR_MEETINGS, 1);
  const sectorMarks = sectorProgress * 10;

  // Unit Level Meetings
  const units = sector.units || [];
  let unitMarks = 0;
  
  if (units.length > 0) {
    let totalCompletedUnitMeetings = 0;
    const totalRequiredUnitMeetings = units.length * REQUIRED_UNIT_MEETINGS;
    
    units.forEach(unit => {
      const unitReports = sector.reports.filter(r => 
        r.meeting.targetGroup === 'UNIT' && r.unitId === unit.id
      );
      const uniqueUnitMeetings = new Set(unitReports.map(r => r.meetingId)).size;
      totalCompletedUnitMeetings += Math.min(uniqueUnitMeetings, REQUIRED_UNIT_MEETINGS);
    });
    
    const unitProgress = totalCompletedUnitMeetings / totalRequiredUnitMeetings;
    unitMarks = unitProgress * 10;
  }

  const total = sectorMarks + unitMarks;

  return {
    total: parseFloat(total.toFixed(2)),
    sectorMarks: parseFloat(sectorMarks.toFixed(2)),
    unitMarks: parseFloat(unitMarks.toFixed(2)),
    sectorPercentage: Math.round(sectorProgress * 100),
    unitPercentage: units.length > 0 ? Math.round((unitMarks / 10) * 100) : 0
  };
}
