export const graphqlQuery = {
    query: `
          {
              user {
                  id
                  auditRatio
                  email
                  firstName
                  lastName
                  login
                  totalDown
                  totalUp
                  login
                  transactions {
                      type
                      amount
                      createdAt
                  }
                  SkillsFiltered: transactions(
                    where: {
                        type: { _regex: "^skill_" }
                    }
                    ) {
                    type
                    amount
                    createdAt
                    }  
                  TransactionsFiltered2: transactions(where: {type: {_eq: "level"},  path: { _like: "%bh-module%", _nregex: "^.*(piscine-js/|piscine-rust/|piscine-ui/|piscine-ux/).*$" }}, order_by: {amount: desc}, limit: 1) {
                      amount
                      type
                      path
                  }
                 totalXP: transactions(
                    where: {
                        type: {_eq: "xp"},
                        path: {
                        _like: "%bh-module%",
                        _nregex: "^.*(piscine-js/|piscine-rust/|piscine-ui/|piscine-ux/|checkpoint/).*$"
                        }
                    }) {
                    amount
                    }
                }
            }`,
};
