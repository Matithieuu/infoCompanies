import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer } from 'recharts';
import Company from '../../data/company';
import { Tooltip } from 'recharts';
import { useCompanyStore } from '../../store/companyStore';
import ChiffreAffaire from '../../data/chiffreAffaire';

export default function Chart() {
  const theme = useTheme();
  // Only use selectedCompany. Don't use setSelectedCompany
  const { selectedCompany } = useCompanyStore();
  const [companyDetails, setCompanyDetails] = React.useState<ChiffreAffaire>(null as unknown as ChiffreAffaire);

  React.useEffect(() => {
    if (selectedCompany !== null && selectedCompany instanceof Company && typeof selectedCompany.getAdresse === 'function') {
      setCompanyDetails(selectedCompany.getAdresseTotal());
    } else {
      setCompanyDetails(null as unknown as ChiffreAffaire);
    }
  }, [selectedCompany]);

  function insertData() {
    const data: { date: string; amount: number }[] = [];
    const chiffreAffaireData = companyDetails;

    if (chiffreAffaireData && chiffreAffaireData.getDate() && chiffreAffaireData.getAdresse()) {
      const dates = chiffreAffaireData.getDate();
      const chiffreAffaireValues = chiffreAffaireData.getAdresse();

      for (let i = 0; i < dates.length; i++) {
        const chiffreAffaire = chiffreAffaireValues[i];
        if (chiffreAffaire !== null && !isNaN(chiffreAffaire)) {
          if (dates.length > 1 && chiffreAffaireValues.length > 1) {
            data.push({ date: dates[i], amount: chiffreAffaire }); // The chart only accepts objects with date and amount
          }
        }
      }
    }
    return data;
  }

  if (companyDetails === null) {
    return <a style={{ fontSize: '19px' }}>Veuillez sélectionner une entreprise</a>;
  }
  if (companyDetails.getAdresse().length === 0) {
    return <a style={{ fontSize: '19px' }}>Pas de données pour cette entreprise</a>;
  }
  else {
    return (
      <React.Fragment>
        <div style={{ display: "flex", justifyContent: 'center', marginTop: 5 }}>Chiffre d'affaire</div>
        <ResponsiveContainer>
          <LineChart
            data={insertData()}
            margin={{
              top: 16,
              right: 16,
              bottom: 10,
              left: 16,
            }}
            style={{ borderRadius: 3 }}
          >
            <XAxis
              dataKey="date"
              stroke={theme.palette.text.secondary}
              style={theme.typography.body2}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              style={theme.typography.body2}
            >
              <Label
                angle={270}
                position="left"
                style={{
                  textAnchor: 'middle',
                  fill: theme.palette.text.primary,
                  ...theme.typography.body1,
                }}
              >
                En Euro (€)
              </Label>
            </YAxis>
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                border: 'none',
                borderRadius: 3,
              }}
              formatter={(value, name, props) => {
                if (value === 0) {
                  return ['Pas de données']
                }
                else {
                  return [`${value} €`, 'Chiffre d\'affaire']
                }
              }}
            />
            <Line
              isAnimationActive={true}
              type="monotone"
              dataKey="amount"
              stroke={theme.palette.primary.main}
              strokeWidth={3}
              dot={true}
              width={10}
            />
          </LineChart>
        </ResponsiveContainer>
      </React.Fragment>
    );
  }
}