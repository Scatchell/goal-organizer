FactoryGirl.define do
  factory :goal do
    sequence :title do |n|
      "test-#{n}"
    end
    parent_id nil
  end
end