module GoalsHelper
  def aggregate_amount_worked_for_week
    Goal.all.each do |goal|
      goal.total_amount_worked += goal.worked_for_week
      goal.worked_for_week = 0
      goal.save
    end
  end
end
