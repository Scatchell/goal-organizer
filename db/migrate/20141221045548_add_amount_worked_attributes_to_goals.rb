class AddAmountWorkedAttributesToGoals < ActiveRecord::Migration
  def change
    add_column :goals, :worked_for_week, :integer
    add_column :goals, :total_amount_worked, :integer

    Goal.find_each do |goal|
      goal.worked_for_week = 0
      goal.total_amount_worked = 0
      goal.save!
    end
  end
end
