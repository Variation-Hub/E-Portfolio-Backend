import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { CPD } from "../entity/Cpd.entity";
import { CustomRequest } from "../util/Interface/expressInterface";

class CpdController {

    public async createCpd(req: CustomRequest, res: Response) {
        try {
            const cpdRepository = AppDataSource.getRepository(CPD)

            const { year, start_date, end_date, cpd_plan, impact_on_you, impact_on_colleagues, impact_on_managers, impact_on_organisation } = req.body

            let cpd = await cpdRepository.create({ user_id: req.user.user_id, year, start_date, end_date, cpd_plan, impact_on_you, impact_on_colleagues, impact_on_managers, impact_on_organisation })

            cpd = await cpdRepository.save(cpd)

            return res.status(200).json({
                message: "CPD create successfully",
                status: true,
                data: cpd
            })

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false
            })
        }
    }

    public async updateCpd(req: CustomRequest, res: Response) {
        try {
            const cpdRepository = AppDataSource.getRepository(CPD)

            const { user_id, year, start_date, end_date, cpd_plan, impact_on_you, impact_on_colleagues, impact_on_managers, impact_on_organisation, activity, evaluation, reflection } = req.body

            let cpd = await cpdRepository.findOne({ where: { user_id, year: year } })

            cpd.start_date = start_date || cpd.start_date
            cpd.end_date = end_date || cpd.end_date
            cpd.cpd_plan = cpd_plan || cpd.cpd_plan
            cpd.impact_on_you = impact_on_you || cpd.impact_on_you
            cpd.impact_on_colleagues = impact_on_colleagues || cpd.impact_on_colleagues
            cpd.impact_on_managers = impact_on_managers || cpd.impact_on_managers
            cpd.impact_on_organisation = impact_on_organisation || cpd.impact_on_organisation
            cpd.activity = activity || cpd.activity
            cpd.evaluation = evaluation || cpd.evaluation
            cpd.reflection = reflection || cpd.reflection

            cpd = await cpdRepository.save(cpd)

            return res.status(200).json({
                message: "CPD update successfully",
                status: true,
                data: cpd
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Internal Server Error",
                status: false
            })
        }
    }
}

export default CpdController;