import express, { Request, Response } from 'express';
import { db } from '../config/db';

const router = express.Router();

// ===== BONUS CRITERIA & TIERS =====

router.get('/bonus-tiers', (req: Request, res: Response) => {
    try {
        const tiers = db.prepare(`
      SELECT * FROM bonus_criteria_tiers
      ORDER BY tier_level ASC
    `).all();
        res.json(tiers);
    } catch (error) {
        console.error('Error fetching bonus tiers:', error);
        res.status(500).json({ error: 'Failed to fetch bonus tiers' });
    }
});

router.post('/bonus-tiers', (req: Request, res: Response) => {
    try {
        const { tier_name, tier_level, min_salary, max_salary, bonus_percentage, criteria_description, status } = req.body;

        if (!tier_name) {
            return res.status(400).json({ error: 'Tier name is required' });
        }

        const result = db.prepare(`
      INSERT INTO bonus_criteria_tiers (
        tier_name, tier_level, min_salary, max_salary, bonus_percentage, criteria_description, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(tier_name, tier_level || 0, min_salary || 0, max_salary || 0, bonus_percentage || 0, criteria_description || null, status || 'Active');

        res.status(201).json({ id: result.lastInsertRowid, message: 'Bonus tier created successfully' });
    } catch (error) {
        console.error('Error creating bonus tier:', error);
        res.status(500).json({ error: 'Failed to create bonus tier' });
    }
});

router.put('/bonus-tiers/:tierId', (req: Request, res: Response) => {
    try {
        const { tierId } = req.params;
        const { tier_name, tier_level, min_salary, max_salary, bonus_percentage, criteria_description, status } = req.body;

        db.prepare(`
      UPDATE bonus_criteria_tiers
      SET tier_name = ?, tier_level = ?, min_salary = ?, max_salary = ?, bonus_percentage = ?,
          criteria_description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(tier_name, tier_level, min_salary, max_salary, bonus_percentage, criteria_description, status, tierId);

        res.json({ message: 'Bonus tier updated successfully' });
    } catch (error) {
        console.error('Error updating bonus tier:', error);
        res.status(500).json({ error: 'Failed to update bonus tier' });
    }
});

router.delete('/bonus-tiers/:tierId', (req: Request, res: Response) => {
    try {
        const { tierId } = req.params;
        const result = db.prepare('DELETE FROM bonus_criteria_tiers WHERE id = ?').run(tierId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Bonus tier not found' });
        }

        res.json({ message: 'Bonus tier deleted successfully' });
    } catch (error) {
        console.error('Error deleting bonus tier:', error);
        res.status(500).json({ error: 'Failed to delete bonus tier' });
    }
});

// ===== REWARD RECOMMENDATIONS =====

router.get('/reward-recommendations', (req: Request, res: Response) => {
    try {
        const recommendations = db.prepare(`
      SELECT * FROM reward_recommendations
      ORDER BY created_at DESC
    `).all();
        res.json(recommendations);
    } catch (error) {
        console.error('Error fetching reward recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch reward recommendations' });
    }
});

router.post('/reward-recommendations', (req: Request, res: Response) => {
    try {
        const { employee_id, employee_name, department, performance_score, recommendation_type, reward_amount, reward_reason, tier_applicable } = req.body;

        if (!employee_id || !employee_name) {
            return res.status(400).json({ error: 'Employee ID and name are required' });
        }

        const result = db.prepare(`
      INSERT INTO reward_recommendations (
        employee_id, employee_name, department, performance_score, recommendation_type,
        reward_amount, reward_reason, tier_applicable, approval_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(employee_id, employee_name, department || null, performance_score || 0, recommendation_type || null, reward_amount || 0, reward_reason || null, tier_applicable || null, 'Pending');

        res.status(201).json({ id: result.lastInsertRowid, message: 'Reward recommendation created successfully' });
    } catch (error) {
        console.error('Error creating reward recommendation:', error);
        res.status(500).json({ error: 'Failed to create reward recommendation' });
    }
});

router.put('/reward-recommendations/:recommendationId/approve', (req: Request, res: Response) => {
    try {
        const { recommendationId } = req.params;
        const { approved_by } = req.body;

        db.prepare(`
      UPDATE reward_recommendations
      SET approval_status = 'Approved', approved_by = ?, approved_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(approved_by || null, recommendationId);

        res.json({ message: 'Reward recommendation approved successfully' });
    } catch (error) {
        console.error('Error approving reward recommendation:', error);
        res.status(500).json({ error: 'Failed to approve reward recommendation' });
    }
});

router.put('/reward-recommendations/:recommendationId/reject', (req: Request, res: Response) => {
    try {
        const { recommendationId } = req.params;

        db.prepare(`
      UPDATE reward_recommendations
      SET approval_status = 'Rejected', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(recommendationId);

        res.json({ message: 'Reward recommendation rejected successfully' });
    } catch (error) {
        console.error('Error rejecting reward recommendation:', error);
        res.status(500).json({ error: 'Failed to reject reward recommendation' });
    }
});

// ===== PENALTY RULES =====

router.get('/penalty-rules', (req: Request, res: Response) => {
    try {
        const rules = db.prepare(`
      SELECT * FROM penalty_automation_rules
      ORDER BY severity_level DESC
    `).all();
        res.json(rules);
    } catch (error) {
        console.error('Error fetching penalty rules:', error);
        res.status(500).json({ error: 'Failed to fetch penalty rules' });
    }
});

router.post('/penalty-rules', (req: Request, res: Response) => {
    try {
        const { rule_name, rule_type, violation_category, severity_level, penalty_amount, penalty_percentage, description, conditions, auto_apply, status } = req.body;

        if (!rule_name) {
            return res.status(400).json({ error: 'Rule name is required' });
        }

        const result = db.prepare(`
      INSERT INTO penalty_automation_rules (
        rule_name, rule_type, violation_category, severity_level, penalty_amount,
        penalty_percentage, description, conditions, auto_apply, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(rule_name, rule_type || null, violation_category || null, severity_level || 'Medium', penalty_amount || 0, penalty_percentage || 0, description || null, conditions || null, auto_apply ? 1 : 0, status || 'Active');

        res.status(201).json({ id: result.lastInsertRowid, message: 'Penalty rule created successfully' });
    } catch (error) {
        console.error('Error creating penalty rule:', error);
        res.status(500).json({ error: 'Failed to create penalty rule' });
    }
});

router.put('/penalty-rules/:ruleId', (req: Request, res: Response) => {
    try {
        const { ruleId } = req.params;
        const { rule_name, rule_type, violation_category, severity_level, penalty_amount, penalty_percentage, description, conditions, auto_apply, status } = req.body;

        db.prepare(`
      UPDATE penalty_automation_rules
      SET rule_name = ?, rule_type = ?, violation_category = ?, severity_level = ?,
          penalty_amount = ?, penalty_percentage = ?, description = ?, conditions = ?,
          auto_apply = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(rule_name, rule_type, violation_category, severity_level, penalty_amount, penalty_percentage, description, conditions, auto_apply ? 1 : 0, status, ruleId);

        res.json({ message: 'Penalty rule updated successfully' });
    } catch (error) {
        console.error('Error updating penalty rule:', error);
        res.status(500).json({ error: 'Failed to update penalty rule' });
    }
});

router.delete('/penalty-rules/:ruleId', (req: Request, res: Response) => {
    try {
        const { ruleId } = req.params;
        const result = db.prepare('DELETE FROM penalty_automation_rules WHERE id = ?').run(ruleId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Penalty rule not found' });
        }

        res.json({ message: 'Penalty rule deleted successfully' });
    } catch (error) {
        console.error('Error deleting penalty rule:', error);
        res.status(500).json({ error: 'Failed to delete penalty rule' });
    }
});

// ===== PENALTY RECORDS =====

router.get('/penalty-records', (req: Request, res: Response) => {
    try {
        const records = db.prepare(`
      SELECT * FROM penalty_records
      ORDER BY violation_date DESC
    `).all();
        res.json(records);
    } catch (error) {
        console.error('Error fetching penalty records:', error);
        res.status(500).json({ error: 'Failed to fetch penalty records' });
    }
});

router.post('/penalty-records', (req: Request, res: Response) => {
    try {
        const { employee_id, employee_name, department, violation_type, violation_date, penalty_amount, penalty_reason, rule_applied, severity } = req.body;

        if (!employee_id || !employee_name) {
            return res.status(400).json({ error: 'Employee ID and name are required' });
        }

        const result = db.prepare(`
      INSERT INTO penalty_records (
        employee_id, employee_name, department, violation_type, violation_date,
        penalty_amount, penalty_reason, rule_applied, severity, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(employee_id, employee_name, department || null, violation_type || null, violation_date || new Date().toISOString(), penalty_amount || 0, penalty_reason || null, rule_applied || null, severity || 'Medium', 'Applied');

        res.status(201).json({ id: result.lastInsertRowid, message: 'Penalty record created successfully' });
    } catch (error) {
        console.error('Error creating penalty record:', error);
        res.status(500).json({ error: 'Failed to create penalty record' });
    }
});

router.put('/penalty-records/:recordId/appeal', (req: Request, res: Response) => {
    try {
        const { recordId } = req.params;
        const { appeal_status, appeal_reason } = req.body;

        db.prepare(`
      UPDATE penalty_records
      SET appeal_status = ?, appeal_reason = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(appeal_status || 'Pending', appeal_reason || null, recordId);

        res.json({ message: 'Penalty appeal updated successfully' });
    } catch (error) {
        console.error('Error updating penalty appeal:', error);
        res.status(500).json({ error: 'Failed to update penalty appeal' });
    }
});

// ===== REWARD HISTORY =====

router.get('/reward-history', (req: Request, res: Response) => {
    try {
        const history = db.prepare(`
      SELECT * FROM reward_history
      ORDER BY reward_date DESC
    `).all();
        res.json(history);
    } catch (error) {
        console.error('Error fetching reward history:', error);
        res.status(500).json({ error: 'Failed to fetch reward history' });
    }
});

router.post('/reward-history', (req: Request, res: Response) => {
    try {
        const { employee_id, employee_name, reward_type, reward_amount, reward_date, reason, period } = req.body;

        const result = db.prepare(`
      INSERT INTO reward_history (
        employee_id, employee_name, reward_type, reward_amount, reward_date, reason, period, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(employee_id, employee_name, reward_type || null, reward_amount || 0, reward_date || new Date().toISOString(), reason || null, period || null, 'Completed');

        res.status(201).json({ id: result.lastInsertRowid, message: 'Reward history entry created successfully' });
    } catch (error) {
        console.error('Error creating reward history entry:', error);
        res.status(500).json({ error: 'Failed to create reward history entry' });
    }
});

// ===== PENALTY HISTORY =====

router.get('/penalty-history', (req: Request, res: Response) => {
    try {
        const history = db.prepare(`
      SELECT * FROM penalty_history
      ORDER BY penalty_date DESC
    `).all();
        res.json(history);
    } catch (error) {
        console.error('Error fetching penalty history:', error);
        res.status(500).json({ error: 'Failed to fetch penalty history' });
    }
});

router.post('/penalty-history', (req: Request, res: Response) => {
    try {
        const { employee_id, employee_name, penalty_type, penalty_amount, penalty_date, reason, period } = req.body;

        const result = db.prepare(`
      INSERT INTO penalty_history (
        employee_id, employee_name, penalty_type, penalty_amount, penalty_date, reason, period, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(employee_id, employee_name, penalty_type || null, penalty_amount || 0, penalty_date || new Date().toISOString(), reason || null, period || null, 'Completed');

        res.status(201).json({ id: result.lastInsertRowid, message: 'Penalty history entry created successfully' });
    } catch (error) {
        console.error('Error creating penalty history entry:', error);
        res.status(500).json({ error: 'Failed to create penalty history entry' });
    }
});

// ===== ANALYTICS =====

router.get('/analytics', (req: Request, res: Response) => {
    try {
        const analytics = db.prepare(`
      SELECT * FROM reward_penalty_analytics
      ORDER BY period DESC
    `).all();
        res.json(analytics);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

router.post('/analytics', (req: Request, res: Response) => {
    try {
        const { period, total_rewards, total_penalties, total_employees_rewarded, total_employees_penalized, average_reward, average_penalty, top_reward_reason, top_penalty_reason } = req.body;

        const result = db.prepare(`
      INSERT INTO reward_penalty_analytics (
        period, total_rewards, total_penalties, total_employees_rewarded, total_employees_penalized,
        average_reward, average_penalty, top_reward_reason, top_penalty_reason
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(period || null, total_rewards || 0, total_penalties || 0, total_employees_rewarded || 0, total_employees_penalized || 0, average_reward || 0, average_penalty || 0, top_reward_reason || null, top_penalty_reason || null);

        res.status(201).json({ id: result.lastInsertRowid, message: 'Analytics entry created successfully' });
    } catch (error) {
        console.error('Error creating analytics entry:', error);
        res.status(500).json({ error: 'Failed to create analytics entry' });
    }
});

// ===== APPEAL MANAGEMENT =====

router.get('/appeals', (req: Request, res: Response) => {
    try {
        const appeals = db.prepare(`
      SELECT * FROM appeal_management
      ORDER BY appeal_date DESC
    `).all();
        res.json(appeals);
    } catch (error) {
        console.error('Error fetching appeals:', error);
        res.status(500).json({ error: 'Failed to fetch appeals' });
    }
});

router.post('/appeals', (req: Request, res: Response) => {
    try {
        const { employee_id, employee_name, appeal_type, penalty_record_id, appeal_reason } = req.body;

        const result = db.prepare(`
      INSERT INTO appeal_management (
        employee_id, employee_name, appeal_type, penalty_record_id, appeal_reason, appeal_date, appeal_status
      )
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    `).run(employee_id, employee_name, appeal_type || null, penalty_record_id || null, appeal_reason || null, 'Pending');

        res.status(201).json({ id: result.lastInsertRowid, message: 'Appeal created successfully' });
    } catch (error) {
        console.error('Error creating appeal:', error);
        res.status(500).json({ error: 'Failed to create appeal' });
    }
});

router.put('/appeals/:appealId/review', (req: Request, res: Response) => {
    try {
        const { appealId } = req.params;
        const { reviewed_by, review_comments, decision } = req.body;

        db.prepare(`
      UPDATE appeal_management
      SET appeal_status = 'Reviewed', reviewed_by = ?, review_date = CURRENT_TIMESTAMP,
          review_comments = ?, decision = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(reviewed_by || null, review_comments || null, decision || null, appealId);

        res.json({ message: 'Appeal reviewed successfully' });
    } catch (error) {
        console.error('Error reviewing appeal:', error);
        res.status(500).json({ error: 'Failed to review appeal' });
    }
});

export default router;
