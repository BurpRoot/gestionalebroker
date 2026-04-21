import { Request, Response, NextFunction } from 'express'
import { dashboardService } from '../services/dashboard.service'

export const dashboardController = {
  async kpis(req: Request, res: Response, next: NextFunction) {
    try { res.json(await dashboardService.getKpis()) } catch (err) { next(err) }
  },

  async casesByStatus(req: Request, res: Response, next: NextFunction) {
    try { res.json(await dashboardService.getCasesByStatus()) } catch (err) { next(err) }
  },

  async revenueTrend(req: Request, res: Response, next: NextFunction) {
    try { res.json(await dashboardService.getRevenueTrend()) } catch (err) { next(err) }
  },

  async topPartners(req: Request, res: Response, next: NextFunction) {
    try { res.json(await dashboardService.getTopPartners()) } catch (err) { next(err) }
  },

  async topCollaborators(req: Request, res: Response, next: NextFunction) {
    try { res.json(await dashboardService.getTopCollaborators()) } catch (err) { next(err) }
  },
}
