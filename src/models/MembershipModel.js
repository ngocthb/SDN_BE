const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    description: { type: String, required: false },
    features: [{
      type: String,
      enum: [
        'daily_tracking',
        'chat_with_coach',
        'achievement_badges',
        'personalized_plan',
        'priority_support',
        'advanced_analytics',
        'community_access',
        'motivational_notifications'
      ]
    }],
    maxCoachSessions: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    tier: { 
      type: String, 
      enum: ['basic', 'premium', 'vip'],
      required: true 
    },
    benefits: [String],
    limitations: [String]
  },
  {
    timestamps: true,
  }
);

const MembershipModel = mongoose.model("memberships", membershipSchema);
module.exports = MembershipModel;
