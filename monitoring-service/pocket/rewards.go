package pocket

const RewardScalingActivationHeight = 69243

type Reward struct {
	PoktAmount   float64
	StakeWeight  float64
	PoktPerRelay float64
}

type MonthlyReward struct {
	Year                    uint
	Month                   uint
	TotalProofs             uint
	AvgSecsBetweenRewards   float64
	TotalSecsBetweenRewards float64
	DaysOfWeek              map[int]*DayOfWeek
	Transactions            []Transaction
}

type DayOfWeek struct {
	Name   string
	Proofs uint
}

func (r *MonthlyReward) PoktAmount() float64 {
	var total float64
	for _, t := range r.Transactions {
		if t.IsConfirmed {
			total += t.PoktAmount()
		}
	}
	return total
}
